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
const viewByUser = ref(false); // Toggle between model view and user view

// Accepted Orders
const models = ref([]);
const loading = ref(false);
const packagerWarehouse = '/api/warehouses/7';
async function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.toWarehouse = packagerWarehouse;
  filterProps.status = 'accepted'
  filterProps.receivedAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.receivedAtTo = props.dateTo + 'T23:59:59';
  filterProps.rowsPerPage = '~';

  await useProductWarehouse().list(filterProps || '')
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
      <div class="text-h6 text-primary">Upakovkaga qabul qilingan mahsulotlar:</div>
      <refresh-button dense :action="getModels" />
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
          icon="inventory"
          label="Mahsulot bo'yicha"
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
          label="Xodim bo'yicha"
          class="q-px-md"
          dense
          no-caps
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-expansion-item
      expand-separator
      label="Qo'shimcha ma'lumotlar"
      header-class="text-primary"
    >
      <q-card>

        <!-- Product View (Default) -->
        <div v-if="!viewByUser">
          <div v-for="(count, modelName) in modelsStats.stats" :key="modelName">
            <q-expansion-item
              :label="`${modelName} (Jami: ${count})`"
              icon="inventory"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(userCount, packagerName) in modelsStats.statsByUser[modelName]" :key="packagerName">
                  <q-splitter v-model="splitterModel">
                    <template v-slot:before>
                      <q-card-section class="q-pl-md">
                        <q-icon name="person" class="q-mr-sm" color="primary" />
                        {{ packagerName }}
                      </q-card-section>
                    </template>

                    <template v-slot:after>
                      <q-card-section class="text-bold text-green">
                        {{ userCount }}
                      </q-card-section>
                    </template>
                  </q-splitter>
                  <q-separator inset="item" />
                </div>
              </q-card>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>

        <!-- User View -->
        <div v-else>
          <div v-for="(count, packagerName) in modelsStats.userStats" :key="packagerName">
            <q-expansion-item
              :label="`${packagerName} (Jami: ${count})`"
              icon="person"
              header-class="text-secondary text-weight-medium"
            >
              <q-card class="q-ml-md">
                <div v-for="(modelCount, modelName) in modelsStats.statsByModel[packagerName]" :key="modelName">
                  <q-splitter v-model="splitterModel">
                    <template v-slot:before>
                      <q-card-section class="q-pl-md">
                        <q-icon name="inventory" class="q-mr-sm" color="secondary" />
                        {{ modelName }}
                      </q-card-section>
                    </template>

                    <template v-slot:after>
                      <q-card-section class="text-bold text-orange">
                        {{ modelCount }}
                      </q-card-section>
                    </template>
                  </q-splitter>
                  <q-separator inset="item" />
                </div>
              </q-card>
            </q-expansion-item>
            <q-separator />
          </div>
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section>
      <div class="text-bold">Jami: {{ modelsStats.total }}</div>
    </q-card-section>
  </q-card>
</template>
