<script setup>
import {computed, onMounted, ref, watch} from "vue"
import RefreshButton from "components/RefreshButton.vue";
import ModelStatsBreakdown from "components/statistics/ModelStatsBreakdown.vue";
import TimingSummary from "components/statistics/TimingSummary.vue";
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import {getStats} from "src/libraries/constants/defaults.js";

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

const models = ref([]);
const loading = ref(false);
const embroideryReadyWarehouse = '/api/warehouses/4';
const sewWarehouse = '/api/warehouses/5';
function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.fromWarehouse = embroideryReadyWarehouse;
  filterProps.toWarehouse = sewWarehouse;
  filterProps.status = 'accepted';
  filterProps.receivedAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.receivedAtTo = props.dateTo + 'T23:59:59';
  filterProps.rowsPerPage = '~';

  useProductWarehouse().list(filterProps)
    .then((res) => {
      models.value = res.data['hydra:member'];
      sendData();
    })
    .finally(() => {
      loading.value = false;
    });
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
  <q-card flat bordered class="q-pa-sm text-green">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">Vishivkadan -> Tikuvga jo'natildi:</div>
      <refresh-button dense :action="getModels" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <ModelStatsBreakdown :models-stats="modelsStats" />

    <TimingSummary :items="models" mode="accepted" />

    <q-card-section>
      <div class="text-bold">Jami: {{ modelsStats.total }}</div>
    </q-card-section>
  </q-card>
</template>
