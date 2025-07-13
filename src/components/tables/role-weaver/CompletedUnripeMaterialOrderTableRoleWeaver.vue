<script setup>
import {onMounted, ref} from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { useI18n } from "vue-i18n";
import ReportList from "components/ReportList.vue";
import RefreshButton from "components/RefreshButton.vue";

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
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useUnripeMaterialOrder();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  status: 'completed'
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchUnripeMaterialOrder({...pagination.value, ...filters.value})
    .then((res) => {
      items.value = res.data['hydra:member'];
      pagination.value.rowsNumber = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

function onRequest(params) {
  pagination.value = {...pagination.value, ...params.pagination};
  getItems();
}
function refresh () {
  getItems();
}

onMounted(() => {
  refresh();
})
</script>

<template>

  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
    :columns="columns"
    :visible-columns="visibleColumns"
    :rows="items"
    row-key="id"
    v-model:pagination.sync="pagination"
    :rows-per-page-options="[10, 25, 50, 100, '~']"
    :loading="loading"
    @request="onRequest"
  >
    <template v-slot:top>
      <div class="col-12 q-gutter-y-sm" :class="$q.screen.lt.sm ? '' : 'flex'">
        <div class="q-table__title">{{ $t('tables.unripeMaterialOrder.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-select
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
            class="w-full"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }} ({{ props.row?.material?.measurement || '-' }})
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <div
              v-for="consume in props.row.expectedConsume"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </div>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <div
              v-for="consume in props.row.consumed"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
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
</template>
