<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { PAGINATION_DEFAULTS } from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import ReportList from "components/ReportList.vue";

const order = useUnripeMaterialOrder();
const orders = ref([]);
const total = ref(0);
const loading = ref(false);

function getOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'completed'

  loading.value = true;
  order.fetchUnripeMaterialOrder(props || '')
    .then((res) => {
      orders.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

const { t } = useI18n();

const columns = [
  { name: 'material', label: t('tables.completedUnripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'quantity', label: t('tables.completedUnripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'completedQuantity', label: t('tables.completedUnripeMaterialOrder.columns.completedQuantity'), align: 'left', field: 'completedQuantity' },
  { name: 'completedQuantitySort2', label: t('tables.completedUnripeMaterialOrder.columns.completedQuantitySort2'), align: 'left', field: 'completedQuantitySort2' },
  { name: 'completedRoll', label: t('tables.completedUnripeMaterialOrder.columns.completedRoll'), align: 'left', field: 'completedRoll' },
  { name: 'completedRollSort2', label: t('tables.completedUnripeMaterialOrder.columns.completedRollSort2'), align: 'left', field: 'completedRollSort2' },
  { name: 'expectedConsume', label: t('tables.completedUnripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.completedUnripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'createdBy', label: t('tables.completedUnripeMaterialOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'completedUnripeMaterialOrders', label: t('tables.completedUnripeMaterialOrder.columns.completedUnripeMaterialOrders'), align: 'left', field: 'completedUnripeMaterialOrders' },
];
const pagination = ref(PAGINATION_DEFAULTS)
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage))

onMounted(() => {
  getOrders( { page: pagination.value.page } )
})
</script>

<template>
  <skeleton-table :loading="loading"/>
  <q-table
    v-show="!loading"
    flat
    bordered
    :rows="orders"
    :columns="columns"
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="pagination"
    hide-bottom
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }} ({{ props.row?.material?.measurement || '-' }})
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <div
              v-for="consume in props.row.expectedConsume"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread }}: {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <div
              v-for="consume in props.row.consumed"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread }}: {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'completedUnripeMaterialOrders'">
            <q-toggle
              v-if="props.row?.completedUnripeMaterialOrders.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders')"
            />
            <span v-else>
              -
            </span>
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <report-list :lists="props.row.completedUnripeMaterialOrders" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div
    v-if="total > pagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="loading"
      v-model="pagination.page"
      input-class="text-bold text-black"
      :max="pagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getOrders({ page: pagination.page })"
    />
  </div>
</template>
