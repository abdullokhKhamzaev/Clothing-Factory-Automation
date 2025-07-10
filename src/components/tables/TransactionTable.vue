<script setup>
import { useI18n } from "vue-i18n";
import {formatDate, formatFloatToInteger, isToday} from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import {ref} from "vue";

// Props
let props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
});

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
</script>

<template>
  <skeleton-table
    :loading="loading"
  />
  <q-table
    v-show="!props.loading"
    flat
    bordered
    :rows="props.transactions"
    :columns="columns"
    :visible-columns="visibleColumns"
    :no-data-label="$t('tables.transaction.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.transaction.header.title') }}</div>
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
          class="q-my-md"
        />
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
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
              :class="props.row.isIncome ? 'bg-green-3' : 'bg-red-3'"
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

<style scoped>
</style>
