<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import {useCompletedUnripeMaterialOrders} from "stores/completedUnripeMaterialOrders.js";
import {useUnripeMaterialOrder} from "stores/unripeMaterialOrder.js";
import RefreshButton from "components/RefreshButton.vue";
import TimingSummary from "components/statistics/TimingSummary.vue";
import {formatFloatToInteger} from "src/libraries/constants/defaults.js";

const props = defineProps({
  dateFrom: {
    type: String,
    required: true,
  },
  dateTo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'accepted',
  },
  title: {
    type: String,
    default: "To'qilgan mahsulotlar:",
  }
})

const emit = defineEmits(['retrieveData']);

const { t } = useI18n();
const viewByUser = ref(false); // Toggle between material view and user view

const orders = ref([]);
const materialsByOrderId = ref({});
const loading = ref(false);

async function getOrders () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  try {
    const [completedRes, ordersRes] = await Promise.all([
      useCompletedUnripeMaterialOrders().fetchOrders({status: props.status, rowsPerPage: '~'}),
      useUnripeMaterialOrder().fetchUnripeMaterialOrder({rowsPerPage: '~'}),
    ]);

    const materialMap = {};
    (ordersRes?.data['hydra:member'] || []).forEach(order => {
      materialMap[order.id] = order.material;
    });
    materialsByOrderId.value = materialMap;

    // completed_unripe_material_orders endpointida sana filtri yo'q, shu sabab clientda filtrlaymiz
    const from = new Date(props.dateFrom + 'T00:00:00');
    const to = new Date(props.dateTo + 'T23:59:59');
    orders.value = (completedRes?.data['hydra:member'] || []).filter(order => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= from && createdAt <= to;
    });

    sendData();
  } finally {
    loading.value = false;
  }
}

function materialNameOf(order) {
  const material = materialsByOrderId.value[order.unripeMaterialOrder?.id];
  return material?.name || `Buyurtma #${order.unripeMaterialOrder?.id || '?'}`;
}

function measurementOf(order) {
  return materialsByOrderId.value[order.unripeMaterialOrder?.id]?.measurement || 'kg';
}

const emptyEntry = () => ({quantity: 0, roll: 0, quantitySort2: 0, rollSort2: 0});

function addToEntry(entry, order) {
  entry.quantity += parseFloat(order.quantity) || 0;
  entry.roll += order.roll || 0;
  entry.quantitySort2 += parseFloat(order.quantitySort2) || 0;
  entry.rollSort2 += order.rollSort2 || 0;

  // O'lchov birligi: aralash bo'lsa ko'rsatilmaydi
  const measurement = measurementOf(order);
  if (entry.measurement === undefined) {
    entry.measurement = measurement;
  } else if (entry.measurement !== measurement) {
    entry.measurement = '';
  }
}

const modelsStats = computed(() => {
  const stats = {};
  const statsByUser = {};
  const userStats = {};
  const statsByModel = {};
  const totals = emptyEntry();

  orders.value.forEach(order => {
    const materialName = materialNameOf(order);
    const weaverName = order.confirmedBy?.fullName || 'Unknown';

    if (!stats[materialName]) {
      stats[materialName] = emptyEntry();
    }
    addToEntry(stats[materialName], order);

    if (!statsByUser[materialName]) {
      statsByUser[materialName] = {};
    }
    if (!statsByUser[materialName][weaverName]) {
      statsByUser[materialName][weaverName] = emptyEntry();
    }
    addToEntry(statsByUser[materialName][weaverName], order);

    if (!userStats[weaverName]) {
      userStats[weaverName] = emptyEntry();
    }
    addToEntry(userStats[weaverName], order);

    if (!statsByModel[weaverName]) {
      statsByModel[weaverName] = {};
    }
    if (!statsByModel[weaverName][materialName]) {
      statsByModel[weaverName][materialName] = emptyEntry();
    }
    addToEntry(statsByModel[weaverName][materialName], order);

    addToEntry(totals, order);
  });

  return {
    stats,
    statsByUser,
    userStats,
    statsByModel,
    total: totals.quantity,
    totalRoll: totals.roll,
    totalSort2: totals.quantitySort2,
    totalRollSort2: totals.rollSort2,
    totalMeasurement: totals.measurement || '',
  };
});

function formatEntry(entry) {
  const unit = entry.measurement ? ` ${entry.measurement}` : '';
  let text = `${formatFloatToInteger(entry.quantity)}${unit} ${t('statistics.and')} ${entry.roll} ${t('statistics.roll')}`;
  if (entry.quantitySort2 > 0 || entry.rollSort2 > 0) {
    text += ` | ${t('statistics.sort2')}: ${formatFloatToInteger(entry.quantitySort2)}${unit} ${t('statistics.and')} ${entry.rollSort2} ${t('statistics.roll')}`;
  }
  return text;
}

function sendData() {
  emit('retrieveData', modelsStats)
}

watch(props, () => {
  getOrders();
}, {deep: true})

onMounted(() => {
  getOrders()
})
</script>

<template>
  <q-card flat bordered class="q-pa-sm text-green q-mb-md">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">{{ props.title }}</div>
      <refresh-button dense :action="getOrders" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <!-- View Toggle Buttons - Always Visible -->
    <q-card-section class="q-pa-sm">
      <div class="row q-px-sm q-gutter-x-sm">
        <q-btn
          @click="viewByUser = false"
          :color="!viewByUser ? 'primary' : 'grey-5'"
          :text-color="!viewByUser ? 'white' : 'grey-7'"
          :unelevated="!viewByUser"
          :outline="viewByUser"
          icon="texture"
          :label="t('statistics.materialView')"
          class="q-px-md"
          dense
          no-caps
        />
        <q-btn
          @click="viewByUser = true"
          :color="viewByUser ? 'primary' : 'grey-5'"
          :text-color="viewByUser ? 'white' : 'grey-7'"
          :unelevated="viewByUser"
          :outline="!viewByUser"
          icon="people"
          dense
          no-caps
          :label="t('statistics.userView')"
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

        <!-- Material View (Default) -->
        <div v-if="!viewByUser">
          <div v-for="(entry, materialName) in modelsStats.stats" :key="materialName">
            <q-expansion-item
              :label="`${materialName} (${t('statistics.total')}: ${formatEntry(entry)})`"
              icon="texture"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(userEntry, weaverName) in modelsStats.statsByUser[materialName]" :key="weaverName">
                  <div class="row justify-between items-center wrap q-px-md q-py-sm">
                    <div>
                      <q-icon name="person" class="q-mr-sm" color="primary" />
                      {{ weaverName }}
                    </div>
                    <div class="text-bold text-green">
                      {{ formatEntry(userEntry) }}
                    </div>
                  </div>
                  <q-separator inset="item" />
                </div>
              </q-card>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>

        <!-- User View -->
        <div v-else>
          <div v-for="(entry, weaverName) in modelsStats.userStats" :key="weaverName">
            <q-expansion-item
              :label="`${weaverName} (${t('statistics.total')}: ${formatEntry(entry)})`"
              icon="person"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(materialEntry, materialName) in modelsStats.statsByModel[weaverName]" :key="materialName">
                  <div class="row justify-between items-center wrap q-px-md q-py-sm">
                    <div>
                      <q-icon name="texture" class="q-mr-sm" color="secondary" />
                      {{ materialName }}
                    </div>
                    <div class="text-bold text-orange">
                      {{ formatEntry(materialEntry) }}
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

    <TimingSummary :items="orders" :mode="props.status === 'accepted' ? 'accepted' : 'pending'" />

    <q-card-section>
      <div class="text-bold">{{ t('statistics.total') }}: {{ formatFloatToInteger(modelsStats.total) }}{{ modelsStats.totalMeasurement ? ' ' + modelsStats.totalMeasurement : '' }} {{ t('statistics.and') }} {{ modelsStats.totalRoll }} {{ t('statistics.roll') }}</div>
      <div v-if="modelsStats.totalSort2 > 0 || modelsStats.totalRollSort2 > 0" class="text-bold text-orange">
        {{ t('statistics.sort2') }}: {{ formatFloatToInteger(modelsStats.totalSort2) }}{{ modelsStats.totalMeasurement ? ' ' + modelsStats.totalMeasurement : '' }} {{ t('statistics.and') }} {{ modelsStats.totalRollSort2 }} {{ t('statistics.roll') }}
      </div>
    </q-card-section>
  </q-card>
</template>
