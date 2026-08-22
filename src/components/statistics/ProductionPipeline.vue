<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import {useCompletedUnripeMaterialOrders} from "stores/completedUnripeMaterialOrders.js";
import {useRipeMaterialOrder} from "stores/ripeMaterialOrder.js";
import {useProductModelOrderCompleted} from "stores/productModelOrderCompleted.js";
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import {useSale} from "stores/sale.js";
import {formatFloatToInteger, formatDuration, getStats, WAREHOUSES} from "src/libraries/constants/defaults.js";

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

const emit = defineEmits(['selectStep']);

const { t } = useI18n();

const weaveOrders = ref([]);
const paintOrders = ref([]);
const cutOrders = ref([]);
const embroideryActions = ref([]);
const sewActions = ref([]);
const packageActions = ref([]);
const toProductWarehouseActions = ref([]);
const sales = ref([]);
const loading = ref(false);

function inRange(createdAt) {
  if (!createdAt) return false;
  const date = new Date(createdAt);
  return date >= new Date(props.dateFrom + 'T00:00:00') && date <= new Date(props.dateTo + 'T23:59:59');
}

async function getData (force = false) {
  if (loading.value) return;
  loading.value = true;

  const range = {
    createdAtFrom: props.dateFrom + 'T00:00:00',
    createdAtTo: props.dateTo + 'T23:59:59',
    rowsPerPage: '~',
  };
  const all = { rowsPerPage: '~' };

  try {
    const [weaveRes, paintRes, cutRes, embroideryRes, sewRes, packageRes, warehouseRes, salesRes] = await Promise.all([
      useCompletedUnripeMaterialOrders().fetchOrders(all),
      useRipeMaterialOrder().fetchRipeMaterialOrder(all),
      useProductModelOrderCompleted().getOrders(range),
      useProductWarehouse().list({...range, toWarehouse: WAREHOUSES.embroideryReadyWarehouse}),
      useProductWarehouse().list({...range, fromWarehouse: WAREHOUSES.sewerWarehouse, toWarehouse: WAREHOUSES.packagerWarehouse}),
      useProductWarehouse().list({...range, fromWarehouse: WAREHOUSES.packagerWarehouse, toWarehouse: WAREHOUSES.packagerReadyWarehouse}),
      useProductWarehouse().list({...range, fromWarehouse: WAREHOUSES.packagerReadyWarehouse, toWarehouse: WAREHOUSES.productsWarehouse}),
      useSale().fetchSales({...range, force: force === true}),
    ]);

    // To'quv va bo'yash endpointlarida sana filtri yo'q — clientda filtrlaymiz
    weaveOrders.value = (weaveRes?.data['hydra:member'] || []).filter(o => inRange(o.createdAt));
    paintOrders.value = (paintRes?.data['hydra:member'] || []).filter(o => inRange(o.createdAt));
    cutOrders.value = cutRes?.data['hydra:member'] || [];
    embroideryActions.value = embroideryRes?.data['hydra:member'] || [];
    sewActions.value = sewRes?.data['hydra:member'] || [];
    packageActions.value = packageRes?.data['hydra:member'] || [];
    toProductWarehouseActions.value = warehouseRes?.data['hydra:member'] || [];
    sales.value = salesRes?.data['hydra:member'] || [];
  } finally {
    loading.value = false;
  }
}

function sumPieces(items) {
  return getStats(items).total;
}

// Kutayotgan yozuvlar ichida eng eskisi qancha vaqtdan beri turganini qaytaradi
function oldestPendingAge(pendingItems) {
  const timestamps = pendingItems
    .map(item => item.createdAt ? new Date(item.createdAt).getTime() : null)
    .filter(Boolean);
  if (!timestamps.length) return null;

  return formatDuration(Date.now() - Math.min(...timestamps), {
    day: t('statistics.timing.day'),
    hour: t('statistics.timing.hour'),
    minute: t('statistics.timing.minute'),
    lessThanMinute: t('statistics.timing.lessThanMinute'),
  });
}

const soldTotal = computed(() => {
  let total = 0;
  sales.value.forEach(sale => {
    (sale.saleProduct || []).forEach(product => {
      (product.quantities || []).forEach(item => {
        total += item.quantity || 0;
      });
    });
  });
  return total;
});

const stages = computed(() => {
  const weaveDone = weaveOrders.value.filter(o => o.status === 'accepted');
  const weavePending = weaveOrders.value.filter(o => o.status === 'notAccepted');
  const sumKg = list => list.reduce((sum, o) => sum + (parseFloat(o.quantity) || 0) + (parseFloat(o.quantitySort2) || 0), 0);

  const paintDone = paintOrders.value.filter(o => o.status === 'accepted');
  const paintPending = paintOrders.value.filter(o => o.status === 'expected');
  const sumSentKg = list => list.reduce((sum, o) => sum + (parseFloat(o.sentQuantitySort1) || 0) + (parseFloat(o.sentQuantitySort2) || 0), 0);

  return [
    {
      key: 'weave',
      name: t('menus.sideBar.weaving'),
      icon: 'texture',
      done: `${formatFloatToInteger(sumKg(weaveDone))} kg`,
      pending: weavePending.length ? `${formatFloatToInteger(sumKg(weavePending))} kg` : null,
      pendingAge: oldestPendingAge(weavePending),
      step: 1,
    },
    {
      key: 'paint',
      name: t('menus.sideBar.paint'),
      icon: 'mdi-palette',
      done: `${formatFloatToInteger(sumSentKg(paintDone))} kg`,
      pending: paintPending.length ? `${formatFloatToInteger(sumSentKg(paintPending))} kg` : null,
      pendingAge: oldestPendingAge(paintPending),
      step: null,
    },
    {
      key: 'cut',
      name: t('menus.sideBar.cutting'),
      icon: 'mdi-scissors-cutting',
      done: formatFloatToInteger(sumPieces(cutOrders.value.filter(o => o.status === 'accepted'))),
      pending: pendingPieces(cutOrders.value),
      pendingAge: oldestPendingAge(cutOrders.value.filter(o => o.status === 'pending')),
      step: 2,
    },
    {
      key: 'embroidery',
      name: t('menus.sideBar.embroidery'),
      icon: 'mdi-draw',
      done: formatFloatToInteger(sumPieces(embroideryActions.value.filter(o => o.status === 'accepted'))),
      pending: pendingPieces(embroideryActions.value),
      pendingAge: oldestPendingAge(embroideryActions.value.filter(o => o.status === 'pending')),
      step: 3,
    },
    {
      key: 'sew',
      name: t('menus.sideBar.sewing'),
      icon: 'mdi-nail',
      done: formatFloatToInteger(sumPieces(sewActions.value.filter(o => o.status === 'accepted'))),
      pending: pendingPieces(sewActions.value),
      pendingAge: oldestPendingAge(sewActions.value.filter(o => o.status === 'pending')),
      step: 4,
    },
    {
      key: 'package',
      name: t('menus.sideBar.package'),
      icon: 'mdi-package-down',
      done: formatFloatToInteger(sumPieces(packageActions.value.filter(o => o.status === 'accepted'))),
      pending: pendingPieces(packageActions.value),
      pendingAge: oldestPendingAge(packageActions.value.filter(o => o.status === 'pending')),
      step: 5,
    },
    {
      key: 'warehouse',
      name: t('menus.sideBar.productWarehouse'),
      icon: 'mdi-warehouse',
      done: formatFloatToInteger(sumPieces(toProductWarehouseActions.value.filter(o => o.status === 'accepted'))),
      pending: pendingPieces(toProductWarehouseActions.value),
      pendingAge: oldestPendingAge(toProductWarehouseActions.value.filter(o => o.status === 'pending')),
      step: 5,
    },
    {
      key: 'sale',
      name: t('menus.sideBar.sales'),
      icon: 'mdi-cart-percent',
      done: formatFloatToInteger(soldTotal.value),
      pending: null,
      step: 6,
    },
  ];
});

function pendingPieces(items) {
  const pending = sumPieces(items.filter(o => o.status === 'pending'));
  return pending > 0 ? formatFloatToInteger(pending) : null;
}

function onStageClick(stage) {
  if (stage.step) {
    emit('selectStep', stage.step);
  }
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
    <q-card-section class="flex justify-between items-center q-py-sm">
      <div>
        <div class="text-h6 text-primary">{{ t('statistics.pipeline.title') }}</div>
        <div class="text-caption text-grey-7">{{ t('statistics.pipeline.caption') }}</div>
      </div>
      <refresh-button dense :action="() => getData(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-card-section class="q-pa-sm" style="overflow-x: auto;">
      <div class="row no-wrap items-stretch">
        <template v-for="(stage, index) in stages" :key="stage.key">
          <q-card
            flat
            bordered
            class="q-pa-sm cursor-pointer column justify-between"
            :class="stage.pending ? 'pipeline-attention' : ''"
            style="min-width: 148px; flex: 1 0 148px;"
            @click="onStageClick(stage)"
          >
            <div class="flex items-center no-wrap q-mb-xs">
              <q-icon :name="stage.icon" :color="stage.pending ? 'deep-orange' : 'primary'" size="22px" class="q-mr-xs" />
              <div class="text-caption text-weight-medium ellipsis">{{ stage.name }}</div>
            </div>

            <div class="text-h6 text-weight-bold text-green">
              {{ stage.done }}
              <q-tooltip>{{ t('statistics.pipeline.confirmed') }}</q-tooltip>
            </div>

            <div v-if="stage.pending" class="q-mt-xs">
              <q-badge color="deep-orange" class="q-pa-xs">
                <q-icon name="mdi-clock-alert-outline" size="14px" class="q-mr-xs" />
                {{ stage.pending }}
                <q-tooltip>{{ t('statistics.pipeline.pending') }}</q-tooltip>
              </q-badge>
              <div v-if="stage.pendingAge" class="text-caption text-deep-orange q-mt-xs">
                {{ t('statistics.timing.oldest') }}: {{ stage.pendingAge }}
              </div>
            </div>
            <div v-else class="q-mt-xs">
              <q-icon name="mdi-check-circle-outline" color="green" size="18px">
                <q-tooltip>{{ t('statistics.pipeline.allConfirmed') }}</q-tooltip>
              </q-icon>
            </div>
          </q-card>

          <div v-if="index < stages.length - 1" class="column justify-center q-px-xs">
            <q-icon name="mdi-arrow-right-bold" color="grey-6" size="20px" />
          </div>
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.pipeline-attention {
  border-color: #ff5722;
  box-shadow: 0 0 6px rgba(255, 87, 34, 0.35);
}
</style>
