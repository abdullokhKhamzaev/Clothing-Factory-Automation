<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import {useRipeMaterialOrder} from "stores/ripeMaterialOrder.js";
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
    default: 'accepted', // 'accepted' | 'expected'
  },
  title: {
    type: String,
    default: "Bo'yalgan mahsulotlar:",
  }
})

const emit = defineEmits(['retrieveData']);

const { t } = useI18n();
const viewByFabric = ref(false); // Material bo'yicha / Fabrika bo'yicha

const orders = ref([]);
const loading = ref(false);

async function getOrders () {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await useRipeMaterialOrder().fetchRipeMaterialOrder({status: props.status, rowsPerPage: '~'});

    // ripe_material_orders endpointida sana filtri yo'q, shu sabab clientda filtrlaymiz
    const from = new Date(props.dateFrom + 'T00:00:00');
    const to = new Date(props.dateTo + 'T23:59:59');
    orders.value = (res?.data['hydra:member'] || []).filter(order => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= from && createdAt <= to;
    });

    sendData();
  } finally {
    loading.value = false;
  }
}

function materialNameOf(order) {
  return order.unripeMaterial?.name || `Buyurtma #${order.id || '?'}`;
}

function fabricNameOf(order) {
  return order.paintFabric?.name || '—';
}

const emptyEntry = () => ({
  sentQuantity: 0, sentRoll: 0, sentQuantitySort2: 0, sentRollSort2: 0,
  receivedQuantity: 0, receivedRoll: 0, receivedQuantitySort2: 0, receivedRollSort2: 0,
});

function addToEntry(entry, order) {
  entry.sentQuantity += parseFloat(order.sentQuantitySort1) || 0;
  entry.sentRoll += order.sentRollSort1 || 0;
  entry.sentQuantitySort2 += parseFloat(order.sentQuantitySort2) || 0;
  entry.sentRollSort2 += order.sentRollSort2 || 0;

  (order.ripeMaterialOrderAccepteds || []).forEach(accepted => {
    entry.receivedQuantity += parseFloat(accepted.receivedQuantitySort1) || 0;
    entry.receivedRoll += accepted.receivedRollSort1 || 0;
    entry.receivedQuantitySort2 += parseFloat(accepted.receivedQuantitySort2) || 0;
    entry.receivedRollSort2 += accepted.receivedRollSort2 || 0;
  });
}

const modelsStats = computed(() => {
  const stats = {};          // material -> entry
  const statsByFabric = {};  // material -> fabric -> entry
  const fabricStats = {};    // fabric -> entry
  const statsByMaterial = {};// fabric -> material -> entry
  const totals = emptyEntry();

  orders.value.forEach(order => {
    const materialName = materialNameOf(order);
    const fabricName = fabricNameOf(order);

    if (!stats[materialName]) stats[materialName] = emptyEntry();
    addToEntry(stats[materialName], order);

    if (!statsByFabric[materialName]) statsByFabric[materialName] = {};
    if (!statsByFabric[materialName][fabricName]) statsByFabric[materialName][fabricName] = emptyEntry();
    addToEntry(statsByFabric[materialName][fabricName], order);

    if (!fabricStats[fabricName]) fabricStats[fabricName] = emptyEntry();
    addToEntry(fabricStats[fabricName], order);

    if (!statsByMaterial[fabricName]) statsByMaterial[fabricName] = {};
    if (!statsByMaterial[fabricName][materialName]) statsByMaterial[fabricName][materialName] = emptyEntry();
    addToEntry(statsByMaterial[fabricName][materialName], order);

    addToEntry(totals, order);
  });

  return {
    stats,
    statsByFabric,
    fabricStats,
    statsByMaterial,
    count: orders.value.length,
    total: totals.sentQuantity,
    totalRoll: totals.sentRoll,
    totalSort2: totals.sentQuantitySort2,
    totalRollSort2: totals.sentRollSort2,
    totalReceived: totals.receivedQuantity,
    totalReceivedRoll: totals.receivedRoll,
    totalReceivedSort2: totals.receivedQuantitySort2,
    totalReceivedRollSort2: totals.receivedRollSort2,
  };
});

const hasReceived = computed(() => modelsStats.value.totalReceived > 0 || modelsStats.value.totalReceivedRoll > 0);

function formatAmount(quantity, roll, quantitySort2, rollSort2) {
  let text = `${formatFloatToInteger(quantity)} kg ${t('statistics.and')} ${roll} ${t('statistics.roll')}`;
  if (quantitySort2 > 0 || rollSort2 > 0) {
    text += ` | ${t('statistics.sort2')}: ${formatFloatToInteger(quantitySort2)} kg ${t('statistics.and')} ${rollSort2} ${t('statistics.roll')}`;
  }
  return text;
}

function formatEntry(entry) {
  let text = `${t('statistics.paint.sent')}: ${formatAmount(entry.sentQuantity, entry.sentRoll, entry.sentQuantitySort2, entry.sentRollSort2)}`;
  if (entry.receivedQuantity > 0 || entry.receivedRoll > 0) {
    text += ` → ${t('statistics.paint.received')}: ${formatAmount(entry.receivedQuantity, entry.receivedRoll, entry.receivedQuantitySort2, entry.receivedRollSort2)}`;
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

    <q-card-section class="q-pa-sm">
      <div class="row q-px-sm q-gutter-x-sm">
        <q-btn
          @click="viewByFabric = false"
          :color="!viewByFabric ? 'primary' : 'grey-5'"
          :text-color="!viewByFabric ? 'white' : 'grey-7'"
          :unelevated="!viewByFabric"
          :outline="viewByFabric"
          icon="texture"
          :label="t('statistics.materialView')"
          class="q-px-md"
          dense
          no-caps
        />
        <q-btn
          @click="viewByFabric = true"
          :color="viewByFabric ? 'primary' : 'grey-5'"
          :text-color="viewByFabric ? 'white' : 'grey-7'"
          :unelevated="viewByFabric"
          :outline="!viewByFabric"
          icon="mdi-factory"
          dense
          no-caps
          :label="t('statistics.paint.fabricView')"
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

        <!-- Material bo'yicha (default) -->
        <div v-if="!viewByFabric">
          <div v-for="(entry, materialName) in modelsStats.stats" :key="materialName">
            <q-expansion-item
              :label="`${materialName} (${t('statistics.total')}: ${formatEntry(entry)})`"
              icon="texture"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(fabricEntry, fabricName) in modelsStats.statsByFabric[materialName]" :key="fabricName">
                  <div class="row justify-between items-center wrap q-px-md q-py-sm">
                    <div>
                      <q-icon name="mdi-factory" class="q-mr-sm" color="primary" />
                      {{ fabricName }}
                    </div>
                    <div class="text-bold text-green">
                      {{ formatEntry(fabricEntry) }}
                    </div>
                  </div>
                  <q-separator inset="item" />
                </div>
              </q-card>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>

        <!-- Fabrika bo'yicha -->
        <div v-else>
          <div v-for="(entry, fabricName) in modelsStats.fabricStats" :key="fabricName">
            <q-expansion-item
              :label="`${fabricName} (${t('statistics.total')}: ${formatEntry(entry)})`"
              icon="mdi-factory"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(materialEntry, materialName) in modelsStats.statsByMaterial[fabricName]" :key="materialName">
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
      <div class="text-bold">
        {{ t('statistics.paint.sent') }}: {{ formatFloatToInteger(modelsStats.total) }} kg {{ t('statistics.and') }} {{ modelsStats.totalRoll }} {{ t('statistics.roll') }}
      </div>
      <div v-if="modelsStats.totalSort2 > 0 || modelsStats.totalRollSort2 > 0" class="text-bold text-orange">
        {{ t('statistics.sort2') }}: {{ formatFloatToInteger(modelsStats.totalSort2) }} kg {{ t('statistics.and') }} {{ modelsStats.totalRollSort2 }} {{ t('statistics.roll') }}
      </div>
      <template v-if="hasReceived">
        <div class="text-bold text-primary q-mt-xs">
          {{ t('statistics.paint.received') }}: {{ formatFloatToInteger(modelsStats.totalReceived) }} kg {{ t('statistics.and') }} {{ modelsStats.totalReceivedRoll }} {{ t('statistics.roll') }}
        </div>
        <div v-if="modelsStats.totalReceivedSort2 > 0 || modelsStats.totalReceivedRollSort2 > 0" class="text-bold text-orange">
          {{ t('statistics.sort2') }}: {{ formatFloatToInteger(modelsStats.totalReceivedSort2) }} kg {{ t('statistics.and') }} {{ modelsStats.totalReceivedRollSort2 }} {{ t('statistics.roll') }}
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>
