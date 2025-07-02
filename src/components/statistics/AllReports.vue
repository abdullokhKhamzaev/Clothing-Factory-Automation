<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import CutModelsAccepted from "components/statistics/CutModelsAccepted.vue";
import CutModelsPending from "components/statistics/CutModelsPending.vue";
import CutModelsDefectAccepted from "components/statistics/CutModelsDefectAccepted.vue";
import CutModelsDefectPending from "components/statistics/CutModelsDefectPending.vue";

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

const step = ref(1);
const splitterModel = ref(50);
const { t } = useI18n();

const cutModelsAcceptedData = ref([])
const cutModelsPendingData = ref([])
const cutModelsDefectAcceptedData = ref([])
const cutModelsDefectPendingData = ref([])

function getCutModelsAcceptedData(data) {
  cutModelsAcceptedData.value = data;
}
function getCutModelsPendingData(data) {
  cutModelsPendingData.value = data;
}
function getCutModelsDefectAcceptedData(data) {
  cutModelsDefectAcceptedData.value = data;
}
function getCutModelsDefectPendingData(data) {
  cutModelsDefectPendingData.value = data;
}

// Get Embroidery Accepted Movements
const embroideryAcceptedMovements = ref([]);
const embroideryAcceptedMovementsLoading = ref(false);
const cutterWarehouse = '/api/warehouses/1';
const embroideryWarehouse = '/api/warehouses/3';
async function getEmbroideryAcceptedMovements () {
  if (embroideryAcceptedMovementsLoading.value) return; // Prevent multiple rapid calls

  embroideryAcceptedMovementsLoading.value = true;

  let filterProps = {};

  filterProps.fromWarehouse = cutterWarehouse;
  filterProps.toWarehouse = embroideryWarehouse;
  filterProps.status = 'accepted';
  filterProps.receivedAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.receivedAtTo = props.dateTo + 'T23:59:59';
  filterProps.noPagination = true;

  await useProductWarehouse().getAll(filterProps)
    .then((res) => {
      embroideryAcceptedMovements.value = res.data['hydra:member'];
    })
    .finally(() => {
      embroideryAcceptedMovementsLoading.value = false;
    });
}

// Get Embroidery Pending Movements
const embroideryPendingMovements = ref([]);
const embroideryPendingMovementsLoading = ref(false);
async function getEmbroideryPendingMovements () {
  if (embroideryPendingMovementsLoading.value) return; // Prevent multiple rapid calls

  embroideryPendingMovementsLoading.value = true;

  let filterProps = {};

  filterProps.fromWarehouse = cutterWarehouse;
  filterProps.toWarehouse = embroideryWarehouse;
  filterProps.status = 'pending';
  filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.createdAtTo = props.dateTo + 'T23:59:59';
  filterProps.noPagination = true;

  await useProductWarehouse().getAll(filterProps)
    .then((res) => {
      embroideryPendingMovements.value = res.data['hydra:member'];
    })
    .finally(() => {
      embroideryPendingMovementsLoading.value = false;
    });
}

async function getMovements () {
  await getEmbroideryAcceptedMovements();
  await getEmbroideryPendingMovements();
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
const embroideryAcceptedMovementsStats = computed(() => getStats(embroideryAcceptedMovements.value));
const embroideryPendingMovementsStats = computed(() => getStats(embroideryPendingMovements.value));

watch(props, () => {
  getMovements();
}, {deep: true})

onMounted(() => {
  getMovements()
})
</script>

<template>
  <q-stepper
    v-model="step"
    ref="stepper"
    color="primary"
    animated
  >
    <q-step
      :name="1"
      :title="t('menus.sideBar.cutting')"
      caption="1000"
      icon="mdi-scissors-cutting"
      :done="step > 1"
    >
      <q-card flat bordered class="q-pa-sm text-weight-medium q-mb-md">
        <div class="flex justify-end q-py-sm q-mr-md">
          <refresh-button dense :action="getMovements" />
        </div>

        <q-linear-progress v-if="embroideryAcceptedMovementsLoading || embroideryPendingMovementsLoading" indeterminate rounded size="xs" color="primary" />
        <q-separator v-else />

        <q-expansion-item
          expand-separator
          label="Qo'shimcha ma'lumotlar"
          header-class="text-primary"
        >
          <q-card>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Bichilgan mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ cutModelsAcceptedData.value?.total || 0 }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Tasdiqni kutayotgan mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section><span class="text-green">? +</span> {{ cutModelsPendingData.value?.total || 0 }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Bichilgan brag mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section><span class="text-green">-</span> {{ cutModelsDefectAcceptedData.value?.total || 0 }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section> Tasdiqni kutayotgan brag mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section><span class="text-green">~</span> {{ cutModelsDefectPendingData.value?.total || 0 }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
          </div>
          </q-card>
        </q-expansion-item>
        <q-card-section>
          <div class="text-bold">Jami: {{ cutModelsAcceptedData.value?.total - cutModelsDefectAcceptedData.value?.total }}</div>
          <div class="text-bold">Vishivkaga o'tdi -> {{ embroideryAcceptedMovementsStats.total }} {{ embroideryPendingMovementsStats.total ? `Kutilmoqda: ${embroideryPendingMovementsStats.total}` : ''  }}</div>
          <div class="text-bold">Tikuvga o'tdi -> Todo</div>
        </q-card-section>
      </q-card>

      <CutModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsAcceptedData" />

      <CutModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsPendingData" />

      <CutModelsDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsDefectAcceptedData" />

      <CutModelsDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsDefectPendingData" />
    </q-step>

    <q-step
      :name="2"
      :title="t('menus.sideBar.embroidery')"
      caption="980"
      icon="mdi-draw"
      :done="step > 2"
    >
      {{ t('menus.sideBar.embroidery') }}
    </q-step>

    <q-step
      :name="3"
      :title="t('menus.sideBar.sewing')"
      caption="980"
      icon="mdi-nail"
      :done="step > 3"
    >
      {{ t('menus.sideBar.sewing') }}
    </q-step>

    <q-step
      :name="4"
      :title="t('menus.sideBar.package')"
      icon="mdi-package-down"
      disable
    >
      {{ t('menus.sideBar.package') }}
    </q-step>

<!--    <template v-slot:navigation>-->
<!--      <q-stepper-navigation>-->
<!--        <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 4 ? 'Finish' : 'Continue'" />-->
<!--        <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back" class="q-ml-sm" />-->
<!--      </q-stepper-navigation>-->
<!--    </template>-->
  </q-stepper>
</template>
