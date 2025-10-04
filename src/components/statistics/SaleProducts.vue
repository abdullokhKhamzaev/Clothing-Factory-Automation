<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue"
import RefreshButton from "components/RefreshButton.vue";
import { useSale } from "stores/sale.js";
import SelectableList from "components/selectableList.vue";
import {useCustomer} from "stores/customer.js";
import {formatFloatToInteger} from "../../libraries/constants/defaults.js";

const customer = useCustomer();

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

const emit = defineEmits(['retrieveData']);

const filters = reactive({
  customer: ''
});

const splitterModel = ref(50);

const models = ref([]);
const loading = ref(false);
function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.customer = filters.customer;
  filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.createdAtTo = props.dateTo + 'T23:59:59';
  filterProps.rowsPerPage = '~';

  useSale().fetchSales(filterProps)
    .then((res) => {
      models.value = res.data['hydra:member'];
      sendData();
    })
    .finally(() => {
      loading.value = false;
    });
}

function getStats(sales) {
  const stats = {};
  const totalPrices = {};
  const totalPaidPrices = {};
  let totalQuantity = 0;
  const allCurrencies = new Set();

  if (Array.isArray(sales)) {
    sales.forEach(sale => {
      const saleProducts = sale.saleProduct || [];
      let rawCurrency = sale.budget?.name || 'Unknown';
      if (rawCurrency.toLowerCase().includes("so'm")) {
        rawCurrency = 'Uzs';
      }

      const currencyKey = rawCurrency.charAt(0).toUpperCase() + rawCurrency.slice(1).toLowerCase();
      const totalKey = `totalPrice${currencyKey}`;
      const paidKey = `totalPaidPrice${currencyKey}`;
      allCurrencies.add(currencyKey);

      const paidPrice = parseFloat(sale.paidPrice || 0);
      const totalSalePrice = parseFloat(sale.totalPrice || 0);

      // Track global paid/price totals
      totalPrices[totalKey] = (totalPrices[totalKey] || 0) + totalSalePrice;
      totalPaidPrices[paidKey] = (totalPaidPrices[paidKey] || 0) + paidPrice;

      // Distribute payment proportionally to each product
      const productCount = saleProducts.length;
      saleProducts.forEach(product => {
        const modelName = product.productModel?.name || 'Unknown Model';
        const quantities = product.quantities || [];

        let modelQuantity = 0;
        let modelPrice = 0;

        quantities.forEach(item => {
          const quantity = item.quantity || 0;
          const unitPrice = parseFloat(item.price || 0);
          modelQuantity += quantity;
          modelPrice += quantity * unitPrice;
        });

        if (!stats[modelName]) {
          stats[modelName] = { quantity: 0 };
        }

        stats[modelName].quantity += modelQuantity;
        stats[modelName][totalKey] = (stats[modelName][totalKey] || 0) + modelPrice;

        // Proportional paid price (e.g. 2 products → divide paid by 2)
        const proportionalPaid = productCount > 0 ? paidPrice / productCount : 0;
        stats[modelName][paidKey] = (stats[modelName][paidKey] || 0) + proportionalPaid;

        totalQuantity += modelQuantity;
      });
    });
  }

  // Ensure all currency fields exist and round
  for (const model in stats) {
    for (const currency of allCurrencies) {
      const totalKey = `totalPrice${currency}`;
      const paidKey = `totalPaidPrice${currency}`;
      stats[model][totalKey] = Math.round((stats[model][totalKey] || 0) * 100) / 100;
      stats[model][paidKey] = Math.round((stats[model][paidKey] || 0) * 100) / 100;
    }
  }

  // Build global totals
  const globalTotals = {};
  for (const currency of allCurrencies) {
    const totalKey = `totalPrice${currency}`;
    const paidKey = `totalPaidPrice${currency}`;
    globalTotals[totalKey] = Math.round((totalPrices[totalKey] || 0) * 100) / 100;
    globalTotals[paidKey] = Math.round((totalPaidPrices[paidKey] || 0) * 100) / 100;
  }

  return {
    stats,
    totalQuantity,
    ...globalTotals
  };
}

const modelsStats = computed(() => getStats(models.value));

function sendData() {
  emit('retrieveData', modelsStats)
}

watch(props, () => {
  getModels();
}, {deep: true})

onMounted(() => {
  getModels()
})
</script>

<template>
  <selectable-list
    v-model="filters.customer"
    dense
    clearable
    :label="$t('tables.users.header.searchTitle')"
    :store="customer"
    fetch-method="fetchCustomers"
    item-value="fullName"
    item-label="fullName"
    :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
    @update:model-value="getModels"
    class="q-mb-sm"
  />

  <q-card flat bordered class="q-pa-sm text-green">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">Mahsulotlar savdosi:</div>
      <refresh-button dense :action="getModels" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-expansion-item
      expand-separator
      label="Qo'shimcha ma'lumotlar"
      header-class="text-primary"
    >
      <q-card>
        <div v-for="(count, modelName) in modelsStats.stats" :key="modelName">
          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-card-section>{{ modelName }}</q-card-section>
            </template>

            <template v-slot:after>
              <q-card-section>
                {{ count.quantity }} {{ $t('piece') }} | ~ {{ count.totalPriceUsd ? `${(formatFloatToInteger((count.totalPriceUsd / count.quantity).toFixed(2)))}$ | Jami: ${count.totalPriceUsd}$` : '' }} {{ count.totalPriceUzs ? `| ${(formatFloatToInteger((count.totalPriceUzs / count.quantity).toFixed(2)))}so'm | Jami: ${count.totalPriceUzs}so'm` : '' }}
              </q-card-section>
            </template>
          </q-splitter>
          <q-separator inset />
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section class="text-h6">
      <div class="text-bold text-primary">Jami: {{ formatFloatToInteger(modelsStats.totalQuantity) }} {{ $t('piece') }}</div>
      <div class="text-bold text-primary">Jami Narxi: {{ modelsStats.totalPriceUsd && `${formatFloatToInteger(modelsStats.totalPriceUsd)}$` }} {{ modelsStats.totalPriceUzs && `+ ${formatFloatToInteger(modelsStats.totalPriceUzs)}so'm` }}</div>
      <div class="text-bold text-green">To'langan: {{ modelsStats.totalPaidPriceUsd && `${formatFloatToInteger(modelsStats.totalPaidPriceUsd)}$` }} {{ modelsStats.totalPaidPriceUzs && `+ ${formatFloatToInteger(modelsStats.totalPaidPriceUzs)}so'm` }}</div>
      <div class="text-bold text-red">Qarzga: {{modelsStats.totalPriceUsd ? `${formatFloatToInteger((modelsStats.totalPriceUsd - modelsStats.totalPaidPriceUsd).toFixed(2))}$` : '' }} {{modelsStats.totalPriceUzs ? `| ${formatFloatToInteger((modelsStats.totalPriceUzs - modelsStats.totalPaidPriceUzs).toFixed(2))}so'm` : '' }}</div>
    </q-card-section>
  </q-card>
</template>
