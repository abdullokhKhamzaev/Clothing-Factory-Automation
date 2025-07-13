<script setup>
import {computed, onMounted, ref, watch} from "vue"
import RefreshButton from "components/RefreshButton.vue";
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

const splitterModel = ref(50);

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
  filterProps.status = 'pending';
  filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.createdAtTo = props.dateTo + 'T23:59:59';
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
  <q-card flat bordered class="q-pa-sm text-warning">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">Vishivkadan -> Tikuvga ~ (Kutilmoqda):</div>
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
              <q-card-section>{{ count }}</q-card-section>
            </template>
          </q-splitter>
          <q-separator inset />
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section>
      <div class="text-bold">Jami: {{ modelsStats.total }}</div>
    </q-card-section>
  </q-card>
</template>
