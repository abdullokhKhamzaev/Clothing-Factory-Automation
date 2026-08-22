<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import {useOrder} from "stores/order.js";
import {useSale} from "stores/sale.js";
import {formatFloatToInteger, roundToDecimal} from "src/libraries/constants/defaults.js";

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

const orders = ref([]);
const sales = ref([]);
const loading = ref(false);

async function getData (force = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    const [ordersRes, salesRes] = await Promise.all([
      useOrder().fetchOrders({rowsPerPage: '~', customer: '', status: ''}),
      useSale().fetchSales({
        createdAtFrom: props.dateFrom + 'T00:00:00',
        createdAtTo: props.dateTo + 'T23:59:59',
        rowsPerPage: '~',
        force: force === true,
      }),
    ]);

    // orders endpointida sana filtri yo'q — clientda filtrlaymiz
    const from = new Date(props.dateFrom + 'T00:00:00');
    const to = new Date(props.dateTo + 'T23:59:59');
    orders.value = (ordersRes?.data['hydra:member'] || []).filter(order => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= from && createdAt <= to;
    });
    sales.value = salesRes?.data['hydra:member'] || [];
  } finally {
    loading.value = false;
  }
}

function sumQuantities(product) {
  return (product.quantities || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

// Buyurtmalardan talab: model va xaridor kesimida
const demandStats = computed(() => {
  const byModel = {};
  const byCustomer = {}; // customer -> {total, byModel: {model: qty}}
  let total = 0;

  orders.value.forEach(order => {
    const customerName = order.customer?.fullName || 'Unknown';
    if (!byCustomer[customerName]) {
      byCustomer[customerName] = { total: 0, byModel: {} };
    }

    (order.products || []).forEach(product => {
      const modelName = product.productModel?.name || 'Unknown Model';
      const quantity = sumQuantities(product);

      byModel[modelName] = (byModel[modelName] || 0) + quantity;
      byCustomer[customerName].total += quantity;
      byCustomer[customerName].byModel[modelName] = (byCustomer[customerName].byModel[modelName] || 0) + quantity;
      total += quantity;
    });
  });

  return { byModel, byCustomer, total };
});

// Sotuvlardan yetkazilganlar: model va xaridor+model kesimida
const deliveredStats = computed(() => {
  const byModel = {};
  const byCustomerModel = {}; // customer -> {model: qty}

  sales.value.forEach(sale => {
    const customerName = sale.customer?.fullName || 'Unknown';
    if (!byCustomerModel[customerName]) {
      byCustomerModel[customerName] = {};
    }

    (sale.saleProduct || []).forEach(product => {
      const modelName = product.productModel?.name || 'Unknown Model';
      const quantity = sumQuantities(product);

      byModel[modelName] = (byModel[modelName] || 0) + quantity;
      byCustomerModel[customerName][modelName] = (byCustomerModel[customerName][modelName] || 0) + quantity;
    });
  });

  return { byModel, byCustomerModel };
});

// 1. Talab vs Yetkazildi (model kesimida)
const modelRows = computed(() => {
  return Object.entries(demandStats.value.byModel)
    .map(([modelName, demand]) => {
      const delivered = deliveredStats.value.byModel[modelName] || 0;
      return {
        modelName,
        demand,
        delivered,
        unmet: Math.max(0, demand - delivered),
        pct: demand > 0 ? roundToDecimal(Math.min(delivered, demand) / demand * 100, 1) : 0,
      };
    })
    .sort((a, b) => b.unmet - a.unmet || b.demand - a.demand);
});

// 2. Eng talabgor modellar
const topDemandModels = computed(() => {
  const total = demandStats.value.total;
  return Object.entries(demandStats.value.byModel)
    .map(([modelName, demand]) => ({
      modelName,
      demand,
      share: total > 0 ? roundToDecimal(demand / total * 100, 1) : 0,
    }))
    .sort((a, b) => b.demand - a.demand);
});

// 3. Xaridorlar kesimida (model bo'yicha moslashtirilgan yetkazish bilan)
const customerRows = computed(() => {
  return Object.entries(demandStats.value.byCustomer)
    .map(([customerName, entry]) => {
      const soldByModel = deliveredStats.value.byCustomerModel[customerName] || {};
      const models = Object.entries(entry.byModel).map(([modelName, demand]) => {
        const delivered = soldByModel[modelName] || 0;
        return {
          modelName,
          demand,
          delivered,
          unmet: Math.max(0, demand - delivered),
        };
      }).sort((a, b) => b.unmet - a.unmet);

      const delivered = models.reduce((sum, m) => sum + Math.min(m.delivered, m.demand), 0);
      return {
        customerName,
        demand: entry.total,
        delivered,
        unmet: Math.max(0, entry.total - delivered),
        pct: entry.total > 0 ? roundToDecimal(delivered / entry.total * 100, 1) : 0,
        models,
      };
    })
    .sort((a, b) => b.unmet - a.unmet || b.demand - a.demand);
});

const totals = computed(() => {
  const demand = demandStats.value.total;
  const delivered = modelRows.value.reduce((sum, row) => sum + Math.min(row.delivered, row.demand), 0);
  return {
    demand,
    delivered,
    unmet: Math.max(0, demand - delivered),
    pct: demand > 0 ? roundToDecimal(delivered / demand * 100, 1) : 0,
  };
});

function pctColor(pct) {
  if (pct >= 90) return 'green';
  if (pct >= 50) return 'orange';
  return 'red';
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
    <q-card-section class="flex justify-between items-center">
      <div>
        <div class="text-h6 text-primary">{{ t('statistics.demand.title') }}</div>
        <div class="text-caption text-grey-7">{{ t('statistics.demand.note') }}</div>
      </div>
      <refresh-button dense :action="() => getData(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <!-- 1. Talab vs Yetkazildi -->
    <q-expansion-item
      expand-separator
      icon="mdi-scale-balance"
      :label="t('statistics.demand.demandVsDelivered')"
      :caption="t('statistics.demand.demandVsDeliveredCaption')"
      header-class="text-primary"
      default-opened
    >
      <q-card-section v-if="!modelRows.length" class="text-grey">
        {{ t('statistics.demand.noData') }}
      </q-card-section>
      <q-card-section v-for="row in modelRows" :key="row.modelName" class="q-py-sm">
        <div class="row justify-between items-center wrap q-mb-xs">
          <div class="text-weight-medium">{{ row.modelName }}</div>
          <div>
            {{ t('statistics.demand.demand') }}: <b>{{ formatFloatToInteger(row.demand) }}</b> |
            {{ t('statistics.demand.delivered') }}: <b class="text-green">{{ formatFloatToInteger(row.delivered) }}</b>
            <q-badge v-if="row.unmet > 0" color="red" class="q-ml-sm">
              {{ t('statistics.demand.unmet') }}: {{ formatFloatToInteger(row.unmet) }}
            </q-badge>
            <q-badge :color="pctColor(row.pct)" class="q-ml-sm">{{ row.pct }}%</q-badge>
          </div>
        </div>
        <q-linear-progress
          :value="row.pct / 100"
          size="10px"
          rounded
          :color="pctColor(row.pct)"
          track-color="grey-3"
        />
      </q-card-section>
    </q-expansion-item>

    <q-separator />

    <!-- 2. Eng talabgor modellar -->
    <q-expansion-item
      expand-separator
      icon="mdi-fire"
      :label="t('statistics.demand.topModels')"
      :caption="t('statistics.demand.topModelsCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!topDemandModels.length" class="text-grey">
        {{ t('statistics.demand.noData') }}
      </q-card-section>
      <q-card-section v-for="(row, index) in topDemandModels" :key="row.modelName" class="q-py-sm">
        <div class="row justify-between items-center wrap q-mb-xs">
          <div class="text-weight-medium">{{ index + 1 }}. {{ row.modelName }}</div>
          <div>
            <b class="text-primary">{{ formatFloatToInteger(row.demand) }} {{ $t('piece') }}</b>
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

    <q-separator />

    <!-- 3. Xaridorlar kesimida -->
    <q-expansion-item
      expand-separator
      icon="mdi-account-group"
      :label="t('statistics.demand.byCustomers')"
      :caption="t('statistics.demand.byCustomersCaption')"
      header-class="text-primary"
    >
      <q-card-section v-if="!customerRows.length" class="text-grey">
        {{ t('statistics.demand.noData') }}
      </q-card-section>
      <div v-for="row in customerRows" :key="row.customerName">
        <q-expansion-item dense>
          <template v-slot:header>
            <q-item-section>
              <div class="text-weight-medium">{{ row.customerName }}</div>
            </q-item-section>
            <q-item-section side>
              <div>
                {{ t('statistics.demand.demand') }}: <b>{{ formatFloatToInteger(row.demand) }}</b>
                <q-badge v-if="row.unmet > 0" color="red" class="q-ml-sm">
                  {{ t('statistics.demand.unmet') }}: {{ formatFloatToInteger(row.unmet) }}
                </q-badge>
                <q-badge :color="pctColor(row.pct)" class="q-ml-sm">{{ row.pct }}%</q-badge>
              </div>
            </q-item-section>
          </template>
          <q-card class="q-ml-md">
            <div v-for="model in row.models" :key="model.modelName">
              <div class="row justify-between items-center wrap q-px-md q-py-sm">
                <div>
                  <q-icon name="inventory" class="q-mr-sm" color="secondary" />
                  {{ model.modelName }}
                </div>
                <div>
                  {{ t('statistics.demand.demand') }}: <b>{{ formatFloatToInteger(model.demand) }}</b> |
                  {{ t('statistics.demand.delivered') }}: <b class="text-green">{{ formatFloatToInteger(model.delivered) }}</b>
                  <q-badge v-if="model.unmet > 0" color="red" class="q-ml-sm">
                    {{ t('statistics.demand.unmet') }}: {{ formatFloatToInteger(model.unmet) }}
                  </q-badge>
                </div>
              </div>
              <q-separator inset="item" />
            </div>
          </q-card>
        </q-expansion-item>
        <q-separator />
      </div>
    </q-expansion-item>

    <q-card-section>
      <div class="text-bold">{{ t('statistics.demand.totalDemand') }}: {{ formatFloatToInteger(totals.demand) }} {{ $t('piece') }}</div>
      <div class="text-bold text-green">{{ t('statistics.demand.totalDelivered') }}: {{ formatFloatToInteger(totals.delivered) }} {{ $t('piece') }} ({{ totals.pct }}%)</div>
      <div v-if="totals.unmet > 0" class="text-bold text-red">{{ t('statistics.demand.totalUnmet') }}: {{ formatFloatToInteger(totals.unmet) }} {{ $t('piece') }}</div>
    </q-card-section>
  </q-card>
</template>
