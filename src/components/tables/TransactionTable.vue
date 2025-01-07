<script setup>
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";

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
  { name: 'paidPrice', label: t('tables.transaction.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'createdBy', label: t('tables.transaction.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'budget', label: t('tables.transaction.columns.budget'), align: 'left', field: 'budget' },
  { name: 'price', label: t('tables.transaction.columns.price'), align: 'left', field: 'price' },
];
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
    :no-data-label="$t('tables.transaction.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.transaction.header.title') }}</div>
<!--        <div class="text-right">-->
<!--          <q-btn-->
<!--            color="primary"-->
<!--            icon-right="add"-->
<!--            :label="$t('tables.transaction.buttons.add')"-->
<!--            no-caps-->
<!--            @click="showFabricCreateModal = true"-->
<!--          />-->
<!--        </div>-->
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'paidPrice'">
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
                {{ props.row.currency.shortName }}
              </span>
            </span>
          </div>
          <div v-else-if="col.name === 'budget'">
            {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row.createdBy.fullName }}
          </div>
          <div v-else-if="col.name === 'price'">
            <span class="q-pa-xs rounded-borders">
              <span class="q-mr-xs">
                {{ formatFloatToInteger(props.row.price) }}
              </span>
              <span>
                {{ props.row.currency.shortName }}
              </span>
            </span>
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
