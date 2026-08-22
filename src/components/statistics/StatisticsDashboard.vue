<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import {useSale} from "stores/sale.js";
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import {useWarehouse} from "stores/warehouse.js";
import {useTransaction} from "stores/transaction.js";
import {formatFloatToInteger, roundToDecimal, getStats, WAREHOUSES} from "src/libraries/constants/defaults.js";

const props = defineProps({
  dateFrom: {
    type: String,
    required: true,
  },
  dateTo: {
    type: String,
    required: true,
  }
})

const { t } = useI18n();

const sales = ref([]);
const producedActions = ref([]);
const productsWarehouse = ref(null);
const transactions = ref([]);
const loading = ref(false);

async function getData (force = false) {
  if (loading.value) return;
  loading.value = true;

  const range = {
    createdAtFrom: props.dateFrom + 'T00:00:00',
    createdAtTo: props.dateTo + 'T23:59:59',
    rowsPerPage: '~',
  };

  try {
    const [salesRes, producedRes, warehouseRes, transactionsRes] = await Promise.all([
      useSale().fetchSales({...range, force: force === true}),
      useProductWarehouse().list({
        ...range,
        fromWarehouse: WAREHOUSES.packagerWarehouse,
        toWarehouse: WAREHOUSES.packagerReadyWarehouse,
        status: 'accepted',
      }),
      useWarehouse().fetchWarehouses({name: 'productsWarehouse'}),
      useTransaction().list({...range, isIncome: false, minPaidPrice: 0}),
    ]);

    sales.value = salesRes?.data['hydra:member'] || [];
    producedActions.value = producedRes?.data['hydra:member'] || [];
    productsWarehouse.value = warehouseRes?.data['hydra:member']?.[0] || null;
    transactions.value = transactionsRes?.data['hydra:member'] || [];
  } finally {
    loading.value = false;
  }
}

function currencyKeyOf(budgetName) {
  let raw = budgetName || 'Unknown';
  if (raw.toLowerCase().includes("so'm")) {
    raw = 'Uzs';
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

const saleTotals = computed(() => {
  let soldQuantity = 0;
  const revenue = {};
  const paid = {};

  sales.value.forEach(sale => {
    const key = currencyKeyOf(sale.budget?.name);
    revenue[key] = (revenue[key] || 0) + (parseFloat(sale.totalPrice) || 0);
    paid[key] = (paid[key] || 0) + (parseFloat(sale.paidPrice) || 0);

    (sale.saleProduct || []).forEach(product => {
      (product.quantities || []).forEach(item => {
        soldQuantity += item.quantity || 0;
      });
    });
  });

  return { soldQuantity, revenue, paid };
});

// Xarajatlar: Xarajatlar bo'limi bilan bir xil mantiq (ayriboshlash va oylik chiqarilgan)
const expenseTotals = computed(() => {
  const expenses = {};
  transactions.value.forEach(transaction => {
    const title = (transaction.description || '').toLowerCase();
    if (title.includes('ayriboshlash') || title.startsWith('payedcustomersalary')) {
      return;
    }
    const key = currencyKeyOf(transaction.budget?.name);
    expenses[key] = (expenses[key] || 0) + (parseFloat(transaction.paidPrice) || 0);
  });
  return expenses;
});

const producedTotal = computed(() => getStats(producedActions.value).total);

const stockTotal = computed(() => {
  const items = productsWarehouse.value?.productInWarehouses || [];
  return items.reduce((sum, item) => {
    return sum + (item.productSize || []).reduce((s, size) => s + (size.quantity || 0), 0);
  }, 0);
});

function moneyLine(byCurrency) {
  const parts = [];
  if (byCurrency.Usd) parts.push(`${formatFloatToInteger(roundToDecimal(byCurrency.Usd))}$`);
  if (byCurrency.Uzs) parts.push(`${formatFloatToInteger(roundToDecimal(byCurrency.Uzs))}so'm`);
  return parts.length ? parts.join(' + ') : '0';
}

const debtLine = computed(() => moneyLine({
  Usd: (saleTotals.value.revenue.Usd || 0) - (saleTotals.value.paid.Usd || 0),
  Uzs: (saleTotals.value.revenue.Uzs || 0) - (saleTotals.value.paid.Uzs || 0),
}));

const cards = computed(() => [
  { label: t('statistics.dashboard.sold'), value: formatFloatToInteger(saleTotals.value.soldQuantity), icon: 'mdi-cart-percent', color: 'green' },
  { label: t('statistics.dashboard.produced'), value: formatFloatToInteger(producedTotal.value), icon: 'mdi-package-down', color: 'primary' },
  { label: t('statistics.dashboard.stock'), value: formatFloatToInteger(stockTotal.value), icon: 'mdi-warehouse', color: 'secondary' },
  { label: t('statistics.dashboard.revenue'), value: moneyLine(saleTotals.value.revenue), icon: 'mdi-cash-plus', color: 'green' },
  { label: t('statistics.dashboard.paid'), value: moneyLine(saleTotals.value.paid), icon: 'mdi-cash-check', color: 'green' },
  { label: t('statistics.dashboard.debt'), value: debtLine.value, icon: 'mdi-cash-clock', color: 'red' },
  { label: `${t('statistics.dashboard.expenses')} (${t('statistics.dashboard.expensesNote')})`, value: moneyLine(expenseTotals.value), icon: 'mdi-wallet', color: 'orange' },
]);

watch(props, () => {
  getData();
}, {deep: true})

onMounted(() => {
  getData()
})
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <q-card-section class="flex justify-between q-py-sm">
      <div class="text-h6 text-primary">{{ $t('menus.sideBar.statistics') }}</div>
      <refresh-button dense :action="() => getData(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-card-section class="q-pa-sm">
      <div class="row q-col-gutter-sm">
        <div v-for="card in cards" :key="card.label" class="col-6 col-sm-4 col-md-3">
          <q-card flat bordered class="q-pa-sm full-height">
            <div class="flex items-center no-wrap">
              <q-icon :name="card.icon" :color="card.color" size="28px" class="q-mr-sm" />
              <div class="ellipsis-2-lines text-caption text-grey-7">{{ card.label }}</div>
            </div>
            <div class="text-h6 text-weight-bold q-mt-xs" :class="`text-${card.color}`">
              {{ card.value }}
            </div>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
