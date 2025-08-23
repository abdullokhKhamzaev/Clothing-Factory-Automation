<script setup>
import { onMounted, ref } from "vue";
import { useTransaction } from "stores/transaction.js";
import { useI18n } from "vue-i18n";
import { formatDate, formatFloatToInteger, isToday } from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();

const columns = [
  { name: 'id', label: t('tables.transaction.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.transaction.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'description', label: t('tables.transaction.columns.description'), align: 'left', field: 'description' },
  { name: 'price', label: t('tables.transaction.columns.price'), align: 'left', field: 'price' },
  { name: 'paidPrice', label: t('tables.transaction.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'createdBy', label: t('tables.transaction.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'budget', label: t('tables.transaction.columns.budget'), align: 'left', field: 'budget' },
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useTransaction();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  // ...
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.list({...pagination.value, ...filters.value})
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
    :no-data-label="$t('tables.transaction.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.transaction.header.title') }}</div>

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
          <div v-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'description'">
            {{ props.row.description.startsWith('other') ? props.row.description.slice(6) : $t('transaction.' + props.row.description.split(" ")[0]) + ': ' + props.row.description.trim().split(/\s+/).slice(1).join(" ")}}
          </div>
          <div v-else-if="col.name === 'price'">
            <span class="q-pa-xs rounded-borders">
              <span class="q-mr-xs">
                {{ formatFloatToInteger(props.row.price) }}
              </span>
              <span>
                {{ props.row.budget.name }}
              </span>
            </span>
          </div>
          <div v-else-if="col.name === 'paidPrice'">
            <span
              class="q-pa-xs rounded-borders"
              :class="props.row.isIncome ? 'bg-green' : 'bg-red'"
            >
              <span class="q-mr-xs">
                {{ props.row.isIncome ? '+' : '-' }}
              </span>
              <span class="q-mr-xs">
                {{ formatFloatToInteger(props.row.paidPrice) }}
              </span>
              <span>
                {{ props.row.budget.name }}
              </span>
            </span>
          </div>
          <div v-else-if="col.name === 'budget'">
            {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row.createdBy.fullName }}
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
