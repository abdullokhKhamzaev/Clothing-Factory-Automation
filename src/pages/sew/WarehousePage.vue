<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { useProductInWarehouse } from "stores/productInWarehouse.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const selectedData = ref({});
const defectActionErr = ref(false);
const reportActionErr = ref(false);
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
const showDefectModal = ref(false);
const showReportModal = ref(false);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);
const rows = ref([{ size: '', quantity: '', max: '' }]);
const warehouse = ref([]);
const cutterDefectiveWarehouse = ref('/api/warehouses/2');
const readyWarehouse = ref('/api/warehouses/7');
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
  { name: 'receivedToSewingBy', label: t('checkedBy'), align: 'left', field: 'receivedToSewingBy' },
  { name: 'status', label: t('tables.warehouseAction.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function acceptAction () {
  if (!user.about['@id'] || !selectedData.value['@id']) {
    console.warn('data not found');
    return
  }

  warehouseActionLoading.value = true;

  const input = {
    status: 'accepted',
    receivedToSewingBy: user.about['@id']
  }

  useProductWarehouse().accept(selectedData.value.id, input)
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
      refresh();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => warehouseActionLoading.value = false)
}
function rejectAction () {
  if (!user.about['@id'] || !selectedData.value['@id']) {
    console.warn('data not found');
    return
  }

  warehouseActionLoading.value = true;

  const input = {
    status: 'rejected',
    receivedToSewingBy: user.about['@id']
  }

  useProductWarehouse().reject(selectedData.value.id, input)
    .then(() => {
      showRejectModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successRejected')
      })
      clearAction();
      refresh();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => warehouseActionLoading.value = false)
}
function getWarehouse (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  props.name = 'sewerWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
      loading.value = false;
    })
    .then(getWarehouseAction)
}
function getWarehouseAction (filterProps) {
  let props = filterProps || {};

  warehouseActionLoading.value = true;

  props.toWarehouses = [cutterDefectiveWarehouse.value, warehouse.value['@id'], readyWarehouse.value];

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
function updateAction() {
  if (!selectedData.value.id) {
    console.warn('data not found');
    return
  }

  loading.value = true;

  let productSize = [];

  rows.value.forEach((product) => {
    productSize.push({ size: product.size, quantity: product.quantity })
  })

  let input = {
    productSize: productSize,
  };

  useProductInWarehouse().update(selectedData.value.id, input)
    .then(() => {
      showUpdateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.warehouse.confirmation.successUpdated')
      })
      clearAction();
      refresh();
    })
    .catch((res) => {
      updateActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.warehouse.confirmation.failure')
      })
    })
    .finally(() => loading.value = false)
}
function defectAction() {
  if (!user.about['@id'] || !selectedData.value['@id'] || !cutterDefectiveWarehouse.value || !warehouse.value['@id']) {
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
    toWarehouse: cutterDefectiveWarehouse.value,
    sentBy: user.about['@id'],
    isDefective: true
  };

  useProductWarehouse().send(input)
    .then(() => {
      showDefectModal.value = false;
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
      defectActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.failureSent')
      })
    })
    .finally(() => loading.value = false)
}
function reportAction() {
  if (!user.about['@id'] || !selectedData.value['@id'] || !readyWarehouse.value || !warehouse.value['@id']) {
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
    toWarehouse: readyWarehouse.value,
    sentBy: user.about['@id'],
    isDefective: false,
    isReady: true
  };

  useProductWarehouse().send(input)
    .then(() => {
      showReportModal.value = false;
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
      reportActionErr.value = res.response.data['hydra:description'];

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
  defectActionErr.value = null;
  reportActionErr.value = null;
  updateActionErr.value = null;
  rows.value = [{ size: '', quantity: '', max: '' }];
}
function refresh() {
  getWarehouse();
}

onMounted(() => {
  refresh()
})

const searchTitle = ref();
const filteredProducts = computed(() => {
  if (!searchTitle.value) {
    return warehouse.value.productInWarehouses || [];
  }

  return (warehouse.value.productInWarehouses || []).filter(item =>
    item.productModel.name.toLowerCase().includes(searchTitle.value.toLowerCase())
  );
});
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
    <q-input
      style="min-width: 225px"
      dense
      clearable
      v-model="searchTitle"
      class="q-mx-md"
      :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
      :label="$t('tables.users.header.searchTitle')"
    >
      <template v-slot:append>
        <q-icon name="search" color="primary" />
      </template>
    </q-input>
    <q-item v-if="!filteredProducts.length">
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">{{ $t('productNotFound') }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      v-for="(item, index) in filteredProducts"
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
                  v-close-popup
                  class="text-orange"
                  clickable
                  @click="selectedData = {...item}; prefill(); showUpdateModal = true;"
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="edit"
                      color="orange"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('edit') }}
                  </q-item-section>
                </q-item>
                <q-item
                  v-close-popup
                  class="text-red"
                  clickable
                  @click="selectedData = {...item}; prefill(); showDefectModal = true;"
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
                    {{ $t('sendToCutterDefective') }}
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-close-popup
                  class="text-primary"
                  clickable
                  @click="selectedData = {...item}; prefill(); showReportModal = true;"
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="mdi-cube-send"
                      color="primary"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('report') }}
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
    :loading="loading || warehouseActionLoading"
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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
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
          <div v-else-if="col.name === 'receivedToSewingBy'">
            {{ props.row?.receivedToSewingBy?.fullName || '-' }}
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
          <div v-else-if="col.name === 'action' && props.row.status === 'pending' && warehouse.name === props.row.toWarehouse.name">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                dense
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-check"
                @click="selectedData = {...props.row}; showAcceptModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('accept') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                dense
                no-caps
                no-wrap
                size="md"
                color="red"
                icon-right="mdi-cancel"
                @click="selectedData = {...props.row}; showRejectModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('reject') }}
                </q-tooltip>
              </q-btn>
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
  <q-dialog v-model="showDefectModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="defectAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="defectActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterial.barSend') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="defectActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ defectActionErr }}
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
  <q-dialog v-model="showReportModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="reportAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="reportActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.completedMaterialOrderReport.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="reportActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ reportActionErr }}
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
  <q-dialog v-model="showAcceptModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.accept.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.accept.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || warehouseActionLoading"
          :loading="loading || warehouseActionLoading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction();"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRejectModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.reject.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.reject.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.reject.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || warehouseActionLoading"
          :loading="loading || warehouseActionLoading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="rejectAction()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showUpdateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.warehouse.barUpdate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="updateActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ updateActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            disable
            v-model="selectedData.productModel.name"
            filled
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
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.warehouse.fields.quantity.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.warehouse.fields.quantity.validation.required')]"
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
            :label="$t('forms.warehouse.buttons.update')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
