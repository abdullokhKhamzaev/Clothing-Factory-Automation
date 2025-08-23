<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate, isToday } from "src/libraries/constants/defaults.js";
import ReportList from "components/ReportList.vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();

const columns = [
  { name: 'id', label: t('tables.unripeMaterialOrder.columns.id'), align: 'left', field: 'id' },
  { name: 'material', label: t('tables.unripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'createdAt', label: t('tables.unripeMaterialOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.unripeMaterialOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'quantity', label: t('tables.unripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'completedQuantitySort2', label: t('tables.unripeMaterialOrder.columns.completedQuantitySort2'), align: 'left', field: 'completedQuantitySort2' },
  { name: 'completedRoll', label: t('tables.unripeMaterialOrder.columns.completedRoll'), align: 'left', field: 'completedRoll' },
  { name: 'completedRollSort2', label: t('tables.unripeMaterialOrder.columns.completedRollSort2'), align: 'left', field: 'completedRollSort2' },
  { name: 'completedQuantity', label: t('tables.unripeMaterialOrder.columns.completedQuantity'), align: 'left', field: 'completedQuantity' },
  { name: 'expectedConsume', label: t('tables.unripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.unripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'completedUnripeMaterialOrders', label: t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders'), align: 'left', field: 'completedUnripeMaterialOrders' },
  { name: 'status', label: t('tables.unripeMaterialOrder.columns.status'), align: 'left', field: 'status' },
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
    :no-data-label="$t('tables.completedUnripeMaterialOrder.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.completedUnripeMaterialOrder.header.title') }}</div>

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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-2 text-black'">
          <div v-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <span
              v-for="consume in props.row.expectedConsume"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </span>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <span
              v-for="consume in props.row.consumed"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </span>
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
          <div v-else-if="col.name === 'status'">
            <q-linear-progress
              stripe
              rounded
              size="15px" :value="100" color="green"
              style="min-width: 100px"
            />
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
