<script setup>
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";

// Props
let props = defineProps({
  purchases: {
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
  { name: 'id', label: t('tables.threadPurchase.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.threadPurchase.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'purchasedBy', label: t('tables.threadPurchase.columns.purchasedBy'), align: 'left', field: 'purchasedBy' },
  { name: 'thread', label: t('tables.threadPurchase.columns.thread'), align: 'left', field: 'thread' },
  { name: 'quantity', label: t('tables.threadPurchase.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.threadPurchase.columns.price'), align: 'left', field: 'price' },
  { name: 'paidPrice', label: t('tables.threadPurchase.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'transaction', label: t('tables.threadPurchase.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
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
    :rows="props.purchases"
    :columns="columns"
    :no-data-label="$t('tables.threadPurchase.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.threadPurchase.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'purchasedBy'">
            {{ props.row.purchasedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'thread'">
            {{ props.row.thread.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ formatFloatToInteger(props.row.quantity) }} {{ props.row.thread.measurement }}
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price * props.row.quantity) }} {{ props.row.currency.shortName }}
          </div>
          <div v-else-if="col.name === 'paidPrice'">
            {{ formatFloatToInteger(props.row.paidPrice) }} {{ props.row.currency.shortName }}
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.threadPurchase.columns.transaction')"
            />
          </div>
          <div
            v-else-if="col.name === 'action' && (props.row.price * props.row.quantity) > props.row.paidPrice"
            class="flex justify-end"
          >
            <q-btn
              class="q-px-sm"
              outline
              dense
              no-caps
              :label="$t('pay')"
              text-color="green"
              icon="mdi-cash"
            />
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <transaction-list :lists="props.row.transaction" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style scoped>
</style>
