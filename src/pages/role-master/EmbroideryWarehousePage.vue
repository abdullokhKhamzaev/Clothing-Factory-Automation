<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useI18n } from "vue-i18n";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const warehouse = ref([]);
const cutterDefectiveWarehouse = ref('/api/warehouses/2');
const readyWarehouse = ref('/api/warehouses/4');
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
  { name: 'status', label: t('tables.warehouseAction.columns.status'), align: 'left', field: 'status' }
];
const visibleColumns = ref(columns.map(column => column.name));
function getWarehouse (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  props.name = 'embroideryWarehouse';

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

  useProductWarehouse().list(props || '')
    .then((res) => {
      warehouseActions.value = res.data['hydra:member'];
      warehouseActionTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      warehouseActionLoading.value = false;
    });
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
      :loading="warehouseActionLoading || loading"
      flat
      bordered
      :rows="warehouseActions"
      :columns="columns"
      :visible-columns="visibleColumns"
      :no-data-label="$t('tables.transaction.header.empty')"
      color="primary"
      row-key="id"
      :pagination="warehouseActionPagination"
      hide-bottom
    >
      <template v-slot:top>
        <div class="col-12 flex justify-between">
          <div class="q-table__title">{{ $t('tables.warehouseAction.header.title') }}</div>
          <q-select
            style="min-width: 100px;"
            dense
            multiple
            outlined
            options-dense
            emit-value
            map-options
            v-model="visibleColumns"
            :display-value="$q.lang.table.columns"
            :options="columns"
            option-value="name"
            :label="$t('columns')"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : 'q-mr-sm'"
          />
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
</template>
