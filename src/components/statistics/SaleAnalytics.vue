<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import {useSale} from "stores/sale.js";
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import {useWarehouse} from "stores/warehouse.js";
import {useCustomer} from "stores/customer.js";
import {formatFloatToInteger, roundToDecimal, getStats, formatDate, WAREHOUSES} from "src/libraries/constants/defaults.js";

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
const debtorCustomers = ref([]);
const unpaidSales = ref([]);
const loading = ref(false);

async function getData (force = false) {
  if (loading.value) return;
  loading.value = true;

  const range = {
    createdAtFrom: props.dateFrom + 'T00:00:00',
    createdAtTo: props.dateTo + 'T23:59:59',
    rowsPerPage: '~',
  };
  const isForce = force === true;

  try {
    const [salesRes, producedRes, warehouseRes, debtorsRes, unpaidRes] = await Promise.all([
      useSale().fetchSales({...range, force: isForce}),
      useProductWarehouse().list({
        ...range,
        fromWarehouse: WAREHOUSES.packagerWarehouse,
        toWarehouse: WAREHOUSES.packagerReadyWarehouse,
        status: 'accepted',
      }),
      useWarehouse().fetchWarehouses({name: 'productsWarehouse'}),
      useCustomer().fetchCustomers({hasDebt: true, rowsPerPage: '~'}),
      useSale().fetchSales({isPayed: false, rowsPerPage: '~', force: isForce}),
    ]);

    sales.value = salesRes?.data['hydra:member'] || [];
    producedActions.value = producedRes?.data['hydra:member'] || [];
    productsWarehouse.value = warehouseRes?.data['hydra:member']?.[0] || null;
    debtorCustomers.value = debtorsRes?.data['hydra:member'] || [];
    unpaidSales.value = unpaidRes?.data['hydra:member'] || [];
  } finally {
    loading.value = false;
  }
}

// Sotuvlardan model/xaridor kesimlari
const saleStats = computed(() => {
  const soldByModel = {};
  const byModelCustomer = {}; // model -> customer -> qty
  const customerTotals = {}; // customer -> {quantity, totalPriceUsd, totalPriceUzs}
  let soldTotal = 0;

  sales.value.forEach(sale => {
    const customerName = sale.customer?.fullName || 'Unknown';
    let rawCurrency = sale.budget?.name || 'Unknown';
    if (rawCurrency.toLowerCase().includes("so'm")) {
      rawCurrency = 'Uzs';
    }
    const currencyKey = rawCurrency.charAt(0).toUpperCase() + rawCurrency.slice(1).toLowerCase();
    const totalKey = `totalPrice${currencyKey}`;

    if (!customerTotals[customerName]) {
      customerTotals[customerName] = { quantity: 0 };
    }

    (sale.saleProduct || []).forEach(product => {
      const modelName = product.productModel?.name || 'Unknown Model';

      let modelQuantity = 0;
      let modelPrice = 0;
      (product.quantities || []).forEach(item => {
        const quantity = item.quantity || 0;
        modelQuantity += quantity;
        modelPrice += quantity * parseFloat(item.price || 0);
      });

      soldByModel[modelName] = (soldByModel[modelName] || 0) + modelQuantity;
      soldTotal += modelQuantity;

      if (!byModelCustomer[modelName]) {
        byModelCustomer[modelName] = {};
      }
      byModelCustomer[modelName][customerName] = (byModelCustomer[modelName][customerName] || 0) + modelQuantity;

      customerTotals[customerName].quantity += modelQuantity;
      customerTotals[customerName][totalKey] = (customerTotals[customerName][totalKey] || 0) + modelPrice;
    });
  });

  return { soldByModel, byModelCustomer, customerTotals, soldTotal };
});

// Qadoqlashdan ishlab chiqarilganlar (model -> dona)
const producedByModel = computed(() => getStats(producedActions.value).stats);
const producedTotal = computed(() => getStats(producedActions.value).total);

// 1. Sotuv / Ishlab chiqarish nisbati
const sellThroughRows = computed(() => {
  const modelNames = new Set([
    ...Object.keys(producedByModel.value),
    ...Object.keys(saleStats.value.soldByModel),
  ]);

  return [...modelNames].map(modelName => {
    const produced = producedByModel.value[modelName] || 0;
    const sold = saleStats.value.soldByModel[modelName] || 0;
    return {
      modelName,
      produced,
      sold,
      pct: produced > 0 ? roundToDecimal(sold / produced * 100, 1) : null,
    };
  }).sort((a, b) => b.sold - a.sold);
});

// 2. Top sotilayotgan modellar (ulush % bilan)
const topModels = computed(() => {
  const total = saleStats.value.soldTotal;
  return Object.entries(saleStats.value.soldByModel)
    .map(([modelName, sold]) => ({
      modelName,
      sold,
      share: total > 0 ? roundToDecimal(sold / total * 100, 1) : 0,
    }))
    .sort((a, b) => b.sold - a.sold);
});

// 3. Xaridor konsentratsiyasi: har model bo'yicha eng katta xaridorning ulushi
const concentrationRows = computed(() => {
  return Object.entries(saleStats.value.byModelCustomer).map(([modelName, customers]) => {
    const totalQty = Object.values(customers).reduce((sum, q) => sum + q, 0);
    const list = Object.entries(customers)
      .map(([customerName, quantity]) => ({
        customerName,
        quantity,
        share: totalQty > 0 ? roundToDecimal(quantity / totalQty * 100, 1) : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      modelName,
      totalQty,
      topCustomer: list[0],
      customers: list,
    };
  }).sort((a, b) => (b.topCustomer?.share || 0) - (a.topCustomer?.share || 0));
});

function concentrationColor(share) {
  if (share >= 70) return 'red';
  if (share >= 40) return 'orange';
  return 'green';
}

// 5. Ombordagi qoldiq (hozirgi holat, sanaga bog'liq emas)
const stockRows = computed(() => {
  const items = productsWarehouse.value?.productInWarehouses || [];
  return items.map(item => {
    const modelName = item.productModel?.name || 'Unknown Model';
    const sizes = (item.productSize || []).map(size => ({
      size: size.size,
      quantity: size.quantity || 0,
    }));
    const quantity = sizes.reduce((sum, size) => sum + size.quantity, 0);
    return {
      modelName,
      quantity,
      sizes,
      soldInPeriod: saleStats.value.soldByModel[modelName] || 0,
    };
  })
    .filter(row => row.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);
});

const stockTotal = computed(() => stockRows.value.reduce((sum, row) => sum + row.quantity, 0));

// 6. Qarzdorlar (hozirgi holat, sanaga bog'liq emas)
const debtorRows = computed(() => {
  // Har bir qarzdorning eng eski to'lanmagan sotuv sanasi
  const oldestByCustomer = {};
  unpaidSales.value.forEach(sale => {
    const name = sale.customer?.fullName;
    if (!name || !sale.createdAt) return;
    const remaining = (parseFloat(sale.totalPrice) || 0) - (parseFloat(sale.discount) || 0) - (parseFloat(sale.paidPrice) || 0);
    if (remaining <= 0) return;
    if (!oldestByCustomer[name] || sale.createdAt < oldestByCustomer[name]) {
      oldestByCustomer[name] = sale.createdAt;
    }
  });

  return debtorCustomers.value
    .map(customer => ({
      customerName: customer.fullName,
      usdDebt: parseFloat(customer.usdDebts) || 0,
      uzsDebt: parseFloat(customer.uzsDebts) || 0,
      oldestDebt: oldestByCustomer[customer.fullName] || null,
    }))
    .filter(row => row.usdDebt > 0 || row.uzsDebt > 0)
    .sort((a, b) => (b.usdDebt - a.usdDebt) || (b.uzsDebt - a.uzsDebt));
});

function debtLine(row) {
  const parts = [];
  if (row.usdDebt) parts.push(`${formatFloatToInteger(roundToDecimal(row.usdDebt))}$`);
  if (row.uzsDebt) parts.push(`${formatFloatToInteger(roundToDecimal(row.uzsDebt))}so'm`);
  return parts.join(' + ');
}

// 4. Top xaridorlar
const topCustomers = computed(() => {
  const total = saleStats.value.soldTotal;
  return Object.entries(saleStats.value.customerTotals)
    .map(([customerName, entry]) => ({
      customerName,
      quantity: entry.quantity,
      share: total > 0 ? roundToDecimal(entry.quantity / total * 100, 1) : 0,
      totalPriceUsd: entry.totalPriceUsd || 0,
      totalPriceUzs: entry.totalPriceUzs || 0,
    }))
    .sort((a, b) => b.quantity - a.quantity);
});

function customerPriceLine(entry) {
  const parts = [];
  if (entry.totalPriceUsd) parts.push(`${formatFloatToInteger(roundToDecimal(entry.totalPriceUsd))}$`);
  if (entry.totalPriceUzs) parts.push(`${formatFloatToInteger(roundToDecimal(entry.totalPriceUzs))}so'm`);
  return parts.join(' + ');
}

watch(props, () => {
  getData();
}, {deep: true})

onMounted(() => {
  getData()
})
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">{{ t('statistics.analytics.title') }}</div>
      <refresh-button dense :action="() => getData(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <!-- 1. Sotuv / Ishlab chiqarish -->
    <q-expansion-item
      expand-separator
      icon="mdi-factory"
      :label="t('statistics.analytics.sellThrough')"
      :caption="t('statistics.analytics.sellThroughCaption')"
      header-class="text-primary"
      default-opened
    >
      <q-card-section v-if="!sellThroughRows.length" class="text-grey">
        {{ t('statistics.analytics.noData') }}
      </q-card-section>
      <q-card-section v-for="row in sellThroughRows" :key="row.modelName" class="q-py-sm">
        <div class="row justify-between items-center wrap q-mb-xs">
          <div class="text-weight-medium">{{ row.modelName }}</div>
          <div>
            {{ t('statistics.analytics.produced') }}: <b>{{ formatFloatToInteger(row.produced) }}</b> |
            {{ t('statistics.analytics.sold') }}: <b class="text-green">{{ formatFloatToInteger(row.sold) }}</b>
            <q-badge
              v-if="row.pct !== null"
              :color="row.pct >= 100 ? 'green' : row.pct >= 50 ? 'primary' : 'orange'"
              class="q-ml-sm"
            >
              {{ row.pct }}%
            </q-badge>
            <q-badge v-else color="grey" class="q-ml-sm">{{ t('statistics.analytics.notProducedInPeriod') }}</q-badge>
          </div>
        </div>
        <q-linear-progress
          :value="row.pct !== null ? Math.min(row.pct / 100, 1) : 0"
          size="10px"
          rounded
          :color="row.pct !== null && row.pct >= 100 ? 'green' : 'primary'"
          track-color="grey-3"
        />
      </q-card-section>
    </q-expansion-item>

    <q-separator />

    <!-- 2. Top modellar -->
    <q-expansion-item
      expand-separator
      icon="mdi-trophy"
      :label="t('statistics.analytics.topModels')"
      :caption="t('statistics.analytics.topModelsCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!topModels.length" class="text-grey">
        {{ t('statistics.analytics.noSales') }}
      </q-card-section>
      <q-card-section v-for="(row, index) in topModels" :key="row.modelName" class="q-py-sm">
        <div class="row justify-between items-center wrap q-mb-xs">
          <div class="text-weight-medium">{{ index + 1 }}. {{ row.modelName }}</div>
          <div>
            <b class="text-green">{{ formatFloatToInteger(row.sold) }} {{ $t('piece') }}</b>
            <q-badge color="primary" class="q-ml-sm">{{ row.share }}%</q-badge>
          </div>
        </div>
        <q-linear-progress
          :value="row.share / 100"
          size="10px"
          rounded
          color="green"
          track-color="grey-3"
        />
      </q-card-section>
    </q-expansion-item>

    <q-separator />

    <!-- 3. Xaridor konsentratsiyasi -->
    <q-expansion-item
      expand-separator
      icon="mdi-account-alert"
      :label="t('statistics.analytics.concentration')"
      :caption="t('statistics.analytics.concentrationCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!concentrationRows.length" class="text-grey">
        {{ t('statistics.analytics.noSales') }}
      </q-card-section>
      <div v-for="row in concentrationRows" :key="row.modelName">
        <q-expansion-item dense>
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-medium">{{ row.modelName }}</div>
            </q-item-section>
            <q-item-section side>
              <div>
                {{ row.topCustomer?.customerName }}:
                <q-badge :color="concentrationColor(row.topCustomer?.share || 0)">
                  {{ row.topCustomer?.share }}%
                </q-badge>
              </div>
            </q-item-section>
          </template>
          <q-card class="q-ml-md">
            <div v-for="c in row.customers" :key="c.customerName">
              <div class="row justify-between items-center wrap q-px-md q-py-sm">
                <div>
                  <q-icon name="person" class="q-mr-sm" color="primary" />
                  {{ c.customerName }}
                </div>
                <div>
                  <b>{{ formatFloatToInteger(c.quantity) }} {{ $t('piece') }}</b>
                  <q-badge :color="concentrationColor(c.share)" class="q-ml-sm">{{ c.share }}%</q-badge>
                </div>
              </div>
              <q-separator inset="item" />
            </div>
          </q-card>
        </q-expansion-item>
        <q-separator />
      </div>
    </q-expansion-item>

    <q-separator />

    <!-- 5. Ombordagi qoldiq -->
    <q-expansion-item
      expand-separator
      icon="mdi-warehouse"
      :label="t('statistics.analytics.stock')"
      :caption="t('statistics.analytics.stockCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!stockRows.length" class="text-grey">
        {{ t('statistics.analytics.stockEmpty') }}
      </q-card-section>
      <div v-for="row in stockRows" :key="row.modelName">
        <q-expansion-item dense>
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-medium">{{ row.modelName }}</div>
            </q-item-section>
            <q-item-section side>
              <div>
                <b class="text-primary">{{ formatFloatToInteger(row.quantity) }} {{ $t('piece') }}</b>
                <q-badge v-if="!row.soldInPeriod" color="red" class="q-ml-sm">{{ t('statistics.analytics.notSoldInPeriod') }}</q-badge>
                <q-badge v-else color="green" class="q-ml-sm">{{ t('statistics.analytics.soldBadge') }}: {{ formatFloatToInteger(row.soldInPeriod) }}</q-badge>
              </div>
            </q-item-section>
          </template>
          <q-card class="q-ml-md">
            <div v-for="size in row.sizes" :key="size.size">
              <div class="row justify-between items-center wrap q-px-md q-py-sm">
                <div>
                  <q-icon name="straighten" class="q-mr-sm" color="secondary" />
                  {{ size.size }}
                </div>
                <div class="text-bold">
                  {{ formatFloatToInteger(size.quantity) }} {{ $t('piece') }}
                </div>
              </div>
              <q-separator inset="item" />
            </div>
          </q-card>
        </q-expansion-item>
        <q-separator />
      </div>
      <q-card-section v-if="stockRows.length" class="text-bold">
        {{ t('statistics.analytics.totalStock') }}: {{ formatFloatToInteger(stockTotal) }} {{ $t('piece') }}
      </q-card-section>
    </q-expansion-item>

    <q-separator />

    <!-- 6. Qarzdorlar -->
    <q-expansion-item
      expand-separator
      icon="mdi-account-cash"
      :label="t('statistics.analytics.debtors')"
      :caption="t('statistics.analytics.debtorsCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!debtorRows.length" class="text-grey">
        {{ t('statistics.analytics.debtorsEmpty') }}
      </q-card-section>
      <div v-for="(row, index) in debtorRows" :key="row.customerName">
        <div class="row justify-between items-center wrap q-px-md q-py-sm">
          <div>
            <q-icon name="person" class="q-mr-sm" color="red" />
            {{ index + 1 }}. {{ row.customerName }}
          </div>
          <div>
            <b class="text-red">{{ debtLine(row) }}</b>
            <span v-if="row.oldestDebt" class="text-grey-7 q-ml-sm">
              | {{ t('statistics.analytics.debtSince') }}: {{ formatDate(row.oldestDebt) }}
            </span>
          </div>
        </div>
        <q-separator inset="item" />
      </div>
    </q-expansion-item>

    <q-separator />

    <!-- 4. Top xaridorlar -->
    <q-expansion-item
      expand-separator
      icon="mdi-account-star"
      :label="t('statistics.analytics.topCustomers')"
      :caption="t('statistics.analytics.topCustomersCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!topCustomers.length" class="text-grey">
        {{ t('statistics.analytics.noSales') }}
      </q-card-section>
      <q-card-section v-for="(row, index) in topCustomers" :key="row.customerName" class="q-py-sm">
        <div class="row justify-between items-center wrap q-mb-xs">
          <div class="text-weight-medium">{{ index + 1 }}. {{ row.customerName }}</div>
          <div>
            <b class="text-green">{{ formatFloatToInteger(row.quantity) }} {{ $t('piece') }}</b>
            <span v-if="customerPriceLine(row)"> | {{ customerPriceLine(row) }}</span>
            <q-badge color="primary" class="q-ml-sm">{{ row.share }}%</q-badge>
          </div>
        </div>
        <q-linear-progress
          :value="row.share / 100"
          size="10px"
          rounded
          color="primary"
          track-color="grey-3"
        />
      </q-card-section>
    </q-expansion-item>

    <q-card-section>
      <div class="text-bold">{{ t('statistics.analytics.totalSold') }}: {{ formatFloatToInteger(saleStats.soldTotal) }} {{ $t('piece') }}</div>
      <div class="text-bold">{{ t('statistics.analytics.totalProduced') }}: {{ formatFloatToInteger(producedTotal) }} {{ $t('piece') }}</div>
      <div class="text-bold">{{ t('statistics.analytics.totalStock') }}: {{ formatFloatToInteger(stockTotal) }} {{ $t('piece') }}</div>
    </q-card-section>
  </q-card>
</template>
