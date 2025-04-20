<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const selectedData = ref({});
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
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
function clearAction() {
  selectedData.value = {};
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

  <div class="q-mb-lg shadow-3">
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
  </div>

  <h4 class="q-mb-sm">
    {{ $t('tables.model.header.title') }}
  </h4>

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
    </q-item>
  </q-list>
  <!-- Dialogs -->
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
</template>
