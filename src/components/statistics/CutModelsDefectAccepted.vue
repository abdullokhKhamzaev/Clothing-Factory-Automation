<script setup>
import {computed, onMounted, ref, watch} from "vue"
import RefreshButton from "components/RefreshButton.vue";
import {useProductWarehouse} from "stores/productInWarehouseAction.js";

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

// Defect models
const models = ref([]);
const loading = ref(false);
const defectWarehouse = '/api/warehouses/2';
function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.toWarehouse = defectWarehouse;
  filterProps.status = 'accepted';
  filterProps.receivedAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.receivedAtTo = props.dateTo + 'T23:59:59';
  filterProps.noPagination = true;

  useProductWarehouse().getAll(filterProps)
    .then((res) => {
      models.value = res.data['hydra:member'];
      sendData();
    })
    .finally(() => {
      loading.value = false;
    });
}

function getStats(actions) {
  const stats = {};
  let total = 0;

  if (actions) {
    actions.forEach(action => {
      const modelName = action.productModel?.name || 'Unknown Model';
      const quantities = action.productSize.map(sizeItem => sizeItem.quantity || 0);
      const totalQuantity = quantities.reduce((sum, q) => sum + q, 0);

      if (!stats[modelName]) {
        stats[modelName] = 0;
      }

      stats[modelName] += totalQuantity;
      total += totalQuantity;
    });
  }

  return { stats, total };
}
const modelsStats = computed(() => getStats(models.value));

function sendData() {
  emit('retrieveData', modelsStats)
}

watch(props, () => {
  getModels();
}, {deep: true})

onMounted(() => {
  getModels();
})
</script>

<template>
  <q-card flat bordered class="q-pa-sm text-red q-mb-md">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">Qabul qilingan brag mahsulotlar:</div>
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
