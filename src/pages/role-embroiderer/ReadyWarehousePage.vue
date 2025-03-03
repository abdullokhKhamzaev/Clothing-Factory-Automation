<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { formatDate } from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const selectedData = ref({});
const sendActionErr = ref(false);
const showSendModal = ref(false);
const rows = ref([{ size: '', quantity: '', max: '' }]);
const warehouse = ref([]);
const sendingWarehouse = ref([]);
const warehouseActions = ref([]);
const warehouseActionTotal = ref(0);
const warehouseActionLoading = ref(false);
const warehouseActionPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const warehouseActionPagesNumber = computed(() => Math.ceil(warehouseActionTotal.value / warehouseActionPagination.value.rowsPerPage));

const loading = ref(false);
const columns = [
  { name: 'id', label: t('tables.warehouseAction.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.warehouseAction.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'sentBy', label: t('tables.warehouseAction.columns.sentBy'), align: 'left', field: 'sentBy' },
  { name: 'productModel', label: t('tables.warehouseAction.columns.productModel'), align: 'left', field: 'productModel' },
  { name: 'productSize', label: t('tables.warehouseAction.columns.productSize'), align: 'left', field: 'productSize' },
  { name: 'fromWarehouse', label: t('tables.warehouseAction.columns.fromWarehouse'), align: 'left', field: 'fromWarehouse' },
  { name: 'toWarehouse', label: t('tables.warehouseAction.columns.toWarehouse'), align: 'left', field: 'toWarehouse' },
  { name: 'receivedToEmbroideryBy', label: t('checkedBy'), align: 'left', field: 'receivedToEmbroideryBy' },
  { name: 'status', label: t('tables.warehouseAction.columns.status'), align: 'left', field: 'status' },
];

function getWarehouse (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  props.name = 'embroideryReadyWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
      loading.value = false;
    })
    .then(getSendingWarehouse)
}
function getSendingWarehouse (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  props.name = 'sewerWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      sendingWarehouse.value = res.data['hydra:member'][0]['@id'];
      loading.value = false;
    })
    .then(getWarehouseAction)
}
function getWarehouseAction (filterProps) {
  let props = filterProps || {};

  warehouseActionLoading.value = true;

  props.toWarehouses = [sendingWarehouse.value, warehouse.value['@id']];

  useProductWarehouse().getAll(props || '')
    .then((res) => {
      warehouseActions.value = res.data['hydra:member'];
      warehouseActionTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      warehouseActionLoading.value = false;
    });
}
function prefill() {
  let sizes = [];
  selectedData.value.productSize.forEach((size) => {
    sizes.push({ size: size.size, quantity: '', max: size.quantity });
  });
  rows.value = sizes;
}
function sendAction() {
  if (!user.about['@id'] || !selectedData.value['@id'] || !sendingWarehouse.value || !warehouse.value['@id']) {
    console.warn('data not found');
    return
  }

  loading.value = true;

  let productSize = [];

  rows.value.forEach((product) => {
    productSize.push({ size: product.size, quantity: product.quantity })
  })

  let input = {
    productModel: selectedData.value.productModel['@id'],
    productSize: productSize,
    fromWarehouse: warehouse.value['@id'],
    toWarehouse: sendingWarehouse.value,
    sentBy: user.about['@id'],
    isDefective: true
  };

  useProductWarehouse().send(input)
    .then(() => {
      showSendModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successSent')
      })
      clearAction();
      refresh();
    })
    .catch((res) => {
      sendActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.failureSent')
      })
    })
    .finally(() => loading.value = false)
}
function clearAction() {
  selectedData.value = {};
  sendActionErr.value = null;
  rows.value = [{ size: '', quantity: '', max: '' }];
}
function refresh() {
  getWarehouse();
}
function shouldShowAction(data) {
  return !data.some(order => order.status === 'pending');
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-mb-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>

  <div v-show="loading" class=" q-mb-md flex justify-center">
    <q-spinner
      color="primary"
      size="4em"
    />
  </div>

  <q-list
    v-show="!loading"
    bordered
    separator
    class="q-mb-md shadow-3"
  >
    <q-item
      v-for="(item, index) in warehouse.productInWarehouses"
      :key="item"
    >
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">{{ item.productModel.name }}</q-item-label>
        <q-item-label caption>
          <span
            v-for="size in item.productSize"
            :key="size"
            class="q-pl-xs text-primary text-subtitle2 text-weight-bold"
          >
            {{ size.size }} : {{ size.quantity }} {{ warehouse.productInWarehouses.length !== index ? '' : ',' }}
          </span>
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <div class="flex justify-end">
          <q-btn
            color="primary"
            icon="mdi-dots-vertical"
            size="sm"
            round
          >
            <q-menu>
              <q-card>
                <q-item
                  v-if="shouldShowAction(warehouseActions)"
                  v-close-popup
                  class="text-red"
                  clickable
                  @click="selectedData = {...item}; prefill(); showSendModal = true;"
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="mdi-cube-send"
                      color="red"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('sendToSewerWarehouse') }}
                  </q-item-section>
                </q-item>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>
  </q-list>

  <q-table
    :loading="warehouseActionLoading || loading"
    flat
    bordered
    :rows="warehouseActions"
    :columns="columns"
    :no-data-label="$t('tables.transaction.header.empty')"
    color="primary"
    row-key="id"
    :pagination="warehouseActionPagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.warehouseAction.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'sentBy'">
            {{ props.row.sentBy.fullName }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'productModel'">
            {{ props.row.productModel.name }}
          </div>
          <div v-else-if="col.name === 'productSize'">
            <div
              v-for="consume in props.row.productSize"
              :key="consume"
            >
              {{ consume.size }} : {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'fromWarehouse'">
            {{ $t('warehouses.' + props.row.fromWarehouse.name) }}
          </div>
          <div v-else-if="col.name === 'toWarehouse'">
            {{ $t('warehouses.' + props.row.toWarehouse.name) }}
          </div>
          <div v-else-if="col.name === 'receivedToEmbroideryBy'">
            {{ props.row?.receivedToEmbroideryBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'status'">
            <div v-if="props.row.status === 'pending'" class="text-red">
              {{ $t('statuses.' + props.row.status) }}
            </div>
            <div v-else-if="props.row.status === 'accepted'" class="text-green">
              {{ $t('statuses.' + props.row.status) }}
            </div>
            <div v-else class="text-red">
              {{ $t('statuses.' + props.row.status) }}
            </div>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div
    v-show="!loading && !warehouseActionLoading"
    v-if="warehouseActionTotal > warehouseActionPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="warehouseActionLoading"
      v-model="warehouseActionPagination.page"
      input-class="text-bold text-black"
      :max="warehouseActionPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getWarehouseAction({ page: warehouseActionPagination.page })"
    />
  </div>

  <!-- Dialogs -->
  <q-dialog v-model="showSendModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="sendAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="sendActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterial.barSend') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="sendActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ sendActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            disable
            v-model="selectedData.productModel.name"
            filled
            lazy-rules
            :rules="[ val => val && val >= 1 && val <= Number(selectedData.quantity) || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-mb-lg"
        >
          <q-input
            filled
            disable
            v-model="row.size"
            :label="$t('forms.modelOrder.fields.size.label')"
            :rules="[ val => val && val > 0 || $t('forms.modelOrder.fields.size.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            :prefix="`max: ${row.max}`"
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
            :rules="[ val => val !== undefined && val <= Number(row.max) || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || warehouseActionLoading"
            :loading="loading || warehouseActionLoading"
            no-caps
            :label="$t('forms.ripeMaterialPurchase.buttons.send')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
