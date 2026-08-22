<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useProductModelOrderCompleted} from "stores/productModelOrderCompleted.js";
import RefreshButton from "components/RefreshButton.vue";
import ModelStatsBreakdown from "components/statistics/ModelStatsBreakdown.vue";
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

// Accepted Orders
const models = ref([]);
const loading = ref(false);
async function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.status = 'accepted'
  filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.createdAtTo = props.dateTo + 'T23:59:59';
  filterProps.rowsPerPage = '~';

  await useProductModelOrderCompleted().getOrders(filterProps || '')
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
  <q-card flat bordered class="q-pa-sm text-green q-mb-md">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">Bichilgan mahsulotlar:</div>
      <refresh-button dense :action="getModels" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <ModelStatsBreakdown :models-stats="modelsStats" />

    <q-card-section>
      <div class="text-bold">Jami: {{ modelsStats.total }}</div>
    </q-card-section>
  </q-card>
</template>
