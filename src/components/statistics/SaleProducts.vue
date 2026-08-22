<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import { useSale } from "stores/sale.js";
import SelectableList from "components/selectableList.vue";
import {useCustomer} from "stores/customer.js";
import {formatFloatToInteger, roundToDecimal} from "../../libraries/constants/defaults.js";

const customer = useCustomer();
const { t } = useI18n();

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

const viewByCustomer = ref(false); // Toggle between model view and customer view

const models = ref([]);
const loading = ref(false);
function getModels (force = false) {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.customer = filters.customer;
  filterProps.force = force === true;
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
  const statsByCustomer = {}; // model -> customer -> {quantity, totalPrice...}
  const customerStats = {}; // customer -> {quantity, totalPrice..., totalPaidPrice...}
  const statsByModel = {}; // customer -> model -> {quantity, totalPrice...}
  const totalPrices = {};
  const totalPaidPrices = {};
  let totalQuantity = 0;
  const allCurrencies = new Set();

  if (Array.isArray(sales)) {
    sales.forEach(sale => {
      const saleProducts = sale.saleProduct || [];
      const customerName = sale.customer?.fullName || 'Unknown';
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

      // Paid price is exact per customer (one sale -> one customer)
      if (!customerStats[customerName]) {
        customerStats[customerName] = { quantity: 0 };
      }
      customerStats[customerName][paidKey] = (customerStats[customerName][paidKey] || 0) + paidPrice;

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

        // Model -> Customer breakdown
        if (!statsByCustomer[modelName]) {
          statsByCustomer[modelName] = {};
        }
        if (!statsByCustomer[modelName][customerName]) {
          statsByCustomer[modelName][customerName] = { quantity: 0 };
        }
        statsByCustomer[modelName][customerName].quantity += modelQuantity;
        statsByCustomer[modelName][customerName][totalKey] = (statsByCustomer[modelName][customerName][totalKey] || 0) + modelPrice;

        // Customer totals
        customerStats[customerName].quantity += modelQuantity;
        customerStats[customerName][totalKey] = (customerStats[customerName][totalKey] || 0) + modelPrice;

        // Customer -> Model breakdown
        if (!statsByModel[customerName]) {
          statsByModel[customerName] = {};
        }
        if (!statsByModel[customerName][modelName]) {
          statsByModel[customerName][modelName] = { quantity: 0 };
        }
        statsByModel[customerName][modelName].quantity += modelQuantity;
        statsByModel[customerName][modelName][totalKey] = (statsByModel[customerName][modelName][totalKey] || 0) + modelPrice;

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
    statsByCustomer,
    customerStats,
    statsByModel,
    totalQuantity,
    ...globalTotals
  };
}

const modelsStats = computed(() => getStats(models.value));

// "4727 Dona | ~ 2.59$ | Jami: 12254.7$" ko'rinishidagi qator
function priceLine(entry) {
  let text = `${formatFloatToInteger(entry.quantity)} ${t('piece')}`;
  if (entry.totalPriceUsd) {
    text += ` | ~ ${formatFloatToInteger(roundToDecimal(entry.totalPriceUsd / entry.quantity))}$ | ${t('statistics.total')}: ${formatFloatToInteger(roundToDecimal(entry.totalPriceUsd))}$`;
  }
  if (entry.totalPriceUzs) {
    text += ` | ~ ${formatFloatToInteger(roundToDecimal(entry.totalPriceUzs / entry.quantity))}so'm | ${t('statistics.total')}: ${formatFloatToInteger(roundToDecimal(entry.totalPriceUzs))}so'm`;
  }
  return text;
}

// Xaridor sarlavhasi uchun to'langan/qarz bilan qator
function customerLine(entry) {
  let text = priceLine(entry);
  const debtUsd = roundToDecimal((entry.totalPriceUsd || 0) - (entry.totalPaidPriceUsd || 0));
  const debtUzs = roundToDecimal((entry.totalPriceUzs || 0) - (entry.totalPaidPriceUzs || 0));
  if (debtUsd > 0) {
    text += ` | ${t('statistics.dashboard.debt')}: ${formatFloatToInteger(debtUsd)}$`;
  }
  if (debtUzs > 0) {
    text += ` | ${t('statistics.dashboard.debt')}: ${formatFloatToInteger(debtUzs)}so'm`;
  }
  return text;
}

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
      <div class="text-h6 text-primary">{{ t('statistics.sale.title') }}</div>
      <refresh-button dense :action="() => getModels(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <!-- View Toggle Buttons -->
    <q-card-section class="q-pa-sm">
      <div class="row q-px-sm q-gutter-x-sm">
        <q-btn
          @click="viewByCustomer = false"
          :color="!viewByCustomer ? 'primary' : 'grey-5'"
          :text-color="!viewByCustomer ? 'white' : 'grey-7'"
          :unelevated="!viewByCustomer"
          :outline="viewByCustomer"
          icon="inventory"
          :label="t('statistics.modelView')"
          class="q-px-md"
          dense
          no-caps
        />
        <q-btn
          @click="viewByCustomer = true"
          :color="viewByCustomer ? 'primary' : 'grey-5'"
          :text-color="viewByCustomer ? 'white' : 'grey-7'"
          :unelevated="viewByCustomer"
          :outline="!viewByCustomer"
          icon="people"
          dense
          no-caps
          :label="t('statistics.customerView')"
          class="q-px-md"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-expansion-item
      expand-separator
      :label="t('statistics.additionalInfo')"
      header-class="text-primary"
    >
      <q-card>

        <!-- Model View (Default): model -> customers -->
        <div v-if="!viewByCustomer">
          <div v-for="(entry, modelName) in modelsStats.stats" :key="modelName">
            <q-expansion-item
              :label="`${modelName} — ${priceLine(entry)}`"
              icon="inventory"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(customerEntry, customerName) in modelsStats.statsByCustomer[modelName]" :key="customerName">
                  <div class="row justify-between items-center wrap q-px-md q-py-sm">
                    <div>
                      <q-icon name="person" class="q-mr-sm" color="primary" />
                      {{ customerName }}
                    </div>
                    <div class="text-bold text-green">
                      {{ priceLine(customerEntry) }}
                    </div>
                  </div>
                  <q-separator inset="item" />
                </div>
              </q-card>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>

        <!-- Customer View: customer -> models -->
        <div v-else>
          <div v-for="(entry, customerName) in modelsStats.customerStats" :key="customerName">
            <q-expansion-item
              :label="`${customerName} — ${customerLine(entry)}`"
              icon="person"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(modelEntry, modelName) in modelsStats.statsByModel[customerName]" :key="modelName">
                  <div class="row justify-between items-center wrap q-px-md q-py-sm">
                    <div>
                      <q-icon name="inventory" class="q-mr-sm" color="secondary" />
                      {{ modelName }}
                    </div>
                    <div class="text-bold text-orange">
                      {{ priceLine(modelEntry) }}
                    </div>
                  </div>
                  <q-separator inset="item" />
                </div>
              </q-card>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section class="text-h6">
      <div class="text-bold text-primary">Jami: {{ formatFloatToInteger(modelsStats.totalQuantity) }} {{ $t('piece') }}</div>
      <div class="text-bold text-primary">Jami Narxi: {{ modelsStats.totalPriceUsd && `${formatFloatToInteger(modelsStats.totalPriceUsd)}$` }} {{ modelsStats.totalPriceUzs && `+ ${formatFloatToInteger(modelsStats.totalPriceUzs)}so'm` }}</div>
      <div class="text-bold text-green">To'langan: {{ modelsStats.totalPaidPriceUsd && `${formatFloatToInteger(modelsStats.totalPaidPriceUsd)}$` }} {{ modelsStats.totalPaidPriceUzs && `+ ${formatFloatToInteger(modelsStats.totalPaidPriceUzs)}so'm` }}</div>
      <div class="text-bold text-red">Qarzga: {{modelsStats.totalPriceUsd ? `${formatFloatToInteger(roundToDecimal(modelsStats.totalPriceUsd - modelsStats.totalPaidPriceUsd))}$` : '' }} {{modelsStats.totalPriceUzs ? `| ${formatFloatToInteger(roundToDecimal(modelsStats.totalPriceUzs - modelsStats.totalPaidPriceUzs))}so'm` : '' }}</div>
    </q-card-section>
  </q-card>
</template>
