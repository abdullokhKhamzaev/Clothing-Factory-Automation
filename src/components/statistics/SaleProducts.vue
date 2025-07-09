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

  useSale().fetchSalesAll(filterProps)
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
  let totalQuantity = 0;
  const allCurrencies = new Set();

  if (Array.isArray(sales)) {
    sales.forEach(sale => {
      const saleProducts = sale.saleProduct || [];

      // Normalize currency name
      let rawCurrency = sale.budget?.name || 'Unknown';
      if (rawCurrency.toLowerCase().includes("so'm")) {
        rawCurrency = 'Uzs';
      }

      const currencyKey = `total${rawCurrency.charAt(0).toUpperCase()}${rawCurrency.slice(1).toLowerCase()}`;
      allCurrencies.add(currencyKey);

      saleProducts.forEach(product => {
        const modelName = product.productModel?.name || 'Unknown Model';
        const quantities = product.quantities || [];

        let modelQuantity = 0;
        let currencyTotal = 0;

        quantities.forEach(item => {
          const quantity = item.quantity || 0;
          const price = parseFloat(item.price || 0);
          modelQuantity += quantity;
          currencyTotal += quantity * price;
        });

        if (!stats[modelName]) {
          stats[modelName] = { quantity: 0 };
        }

        stats[modelName].quantity += modelQuantity;
        stats[modelName][currencyKey] = (stats[modelName][currencyKey] || 0) + currencyTotal;

        totalQuantity += modelQuantity;
        totalPrices[currencyKey] = (totalPrices[currencyKey] || 0) + currencyTotal;
      });
    });
  }

  // Ensure every model has all currencies
  for (const model in stats) {
    for (const currencyKey of allCurrencies) {
      if (stats[model][currencyKey] === undefined) {
        stats[model][currencyKey] = 0;
      } else {
        stats[model][currencyKey] = Math.round(stats[model][currencyKey] * 100) / 100;
      }
    }
  }

  // Global totals with rounding
  const globalTotals = {};
  for (const currencyKey of allCurrencies) {
    const amount = totalPrices[currencyKey] || 0;
    globalTotals[currencyKey] = Math.round(amount * 100) / 100;
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
              <q-card-section>{{ count.quantity }} {{ $t('piece') }} | ~ {{ count.totalUsd ? `$ ${(count.totalUsd / count.quantity).toFixed(2)}` : '' }} {{ count.totalUzs ? `| So'm ${(count.totalUzs / count.quantity).toFixed(2)}` : '' }}</q-card-section>
            </template>
          </q-splitter>
          <q-separator inset />
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section>
      <div class="text-bold">Jami: {{ formatFloatToInteger(modelsStats.totalQuantity) }} {{ $t('piece') }}</div>
      <div class="text-bold">Jami Narxi: {{ modelsStats.totalUsd && `$ ${formatFloatToInteger(modelsStats.totalUsd)}` }} {{ modelsStats.totalUzs && `+ So'm ${formatFloatToInteger(modelsStats.totalUzs)}` }}</div>
    </q-card-section>
  </q-card>
</template>
