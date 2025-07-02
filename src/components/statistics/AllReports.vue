<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import CutModelsAccepted from "components/statistics/CutModelsAccepted.vue";
import CutModelsPending from "components/statistics/CutModelsPending.vue";
import CutModelsDefectAccepted from "components/statistics/CutModelsDefectAccepted.vue";
import CutModelsDefectPending from "components/statistics/CutModelsDefectPending.vue";
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

// Get Sew Accepted Movements
const sewAcceptedMovements = ref([]);
const sewAcceptedMovementsLoading = ref(false);
const sewWarehouse = '/api/warehouses/5';
async function getSewAcceptedMovements () {
  if (sewAcceptedMovementsLoading.value) return; // Prevent multiple rapid calls

  sewAcceptedMovementsLoading.value = true;

  let filterProps = {};

  filterProps.fromWarehouse = cutterWarehouse;
  filterProps.toWarehouse = sewWarehouse;
  filterProps.status = 'accepted';
  filterProps.receivedAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.receivedAtTo = props.dateTo + 'T23:59:59';
  filterProps.noPagination = true;

  await useProductWarehouse().getAll(filterProps)
    .then((res) => {
      sewAcceptedMovements.value = res.data['hydra:member'];
    })
    .finally(() => {
      sewAcceptedMovementsLoading.value = false;
    });
}

// Get Sew Pending Movements
const sewPendingMovements = ref([]);
const sewPendingMovementsLoading = ref(false);
async function getSewPendingMovements () {
  if (sewPendingMovementsLoading.value) return; // Prevent multiple rapid calls

  sewPendingMovementsLoading.value = true;

  let filterProps = {};

  filterProps.fromWarehouse = cutterWarehouse;
  filterProps.toWarehouse = sewWarehouse;
  filterProps.status = 'pending';
  filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.createdAtTo = props.dateTo + 'T23:59:59';
  filterProps.noPagination = true;

  await useProductWarehouse().getAll(filterProps)
    .then((res) => {
      sewPendingMovements.value = res.data['hydra:member'];
    })
    .finally(() => {
      sewPendingMovementsLoading.value = false;
    });
}

async function getMovements () {
  await getEmbroideryAcceptedMovements();
  await getEmbroideryPendingMovements();
  await getSewAcceptedMovements();
  await getSewPendingMovements();
}

const embroideryAcceptedMovementsStats = computed(() => getStats(embroideryAcceptedMovements.value));
const embroideryPendingMovementsStats = computed(() => getStats(embroideryPendingMovements.value));
const sewAcceptedMovementsStats = computed(() => getStats(sewAcceptedMovements.value));
const sewPendingMovementsStats = computed(() => getStats(sewPendingMovements.value));

watch(props, () => {
  getMovements();
}, {deep: true})

onMounted(() => {
  getMovements()
})
</script>

<template>
  <div class="flex justify-end q-gutter-x-md q-mb-sm">
    <q-btn color="primary" icon="mdi-chevron-double-left" @click="$refs.stepper.previous()" :disable="step === 1" />
    <q-btn color="primary" icon="mdi-chevron-double-right" @click="$refs.stepper.next()" :disable="step === 4" />
  </div>
  <q-stepper
    v-model="step"
    ref="stepper"
    color="primary"
    animated
    class="q-mx-auto w-full"
  >
    <q-step
      :name="1"
      :title="t('menus.sideBar.cutting')"
      :caption="cutModelsAcceptedData.value?.total"
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
                  <q-card-section>{{ cutModelsDefectAcceptedData.value?.total || 0 }}</q-card-section>
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
                  <q-card-section><span class="text-green">? +</span> {{ cutModelsDefectPendingData.value?.total || 0 }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
          </q-card>
        </q-expansion-item>
        <q-card-section>
          <div class="text-bold">Jami: {{ cutModelsAcceptedData.value?.total }}</div>
          <div class="text-bold">Vishivkaga o'tdi -> {{ embroideryAcceptedMovementsStats.total }} {{ embroideryPendingMovementsStats.total ? `(+ Kutilmoqda: ${embroideryPendingMovementsStats.total})` : ''  }}</div>
          <div class="text-bold">Tikuvga o'tdi -> {{ sewAcceptedMovementsStats.total }} {{ sewPendingMovementsStats.total ? `(+ Kutilmoqda: ${sewPendingMovementsStats.total})` : ''  }}</div>
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
<!--      <q-card flat bordered class="q-pa-sm text-weight-medium q-mb-md">-->
<!--        <div class="flex justify-end q-py-sm q-mr-md">-->
<!--          <refresh-button dense :action="getMovements" />-->
<!--        </div>-->

<!--        <q-linear-progress v-if="embroideryAcceptedMovementsLoading || embroideryPendingMovementsLoading" indeterminate rounded size="xs" color="primary" />-->
<!--        <q-separator v-else />-->

<!--        <q-expansion-item-->
<!--          expand-separator-->
<!--          label="Qo'shimcha ma'lumotlar"-->
<!--          header-class="text-primary"-->
<!--        >-->
<!--          <q-card>-->
<!--            <div>-->
<!--              <q-splitter v-model="splitterModel">-->
<!--                <template v-slot:before>-->
<!--                  <q-card-section>Bichilgan mahsulotlar:</q-card-section>-->
<!--                </template>-->
<!--                <template v-slot:after>-->
<!--                  <q-card-section>{{ cutModelsAcceptedData.value?.total || 0 }}</q-card-section>-->
<!--                </template>-->
<!--              </q-splitter>-->
<!--              <q-separator inset />-->
<!--            </div>-->
<!--            <div>-->
<!--              <q-splitter v-model="splitterModel">-->
<!--                <template v-slot:before>-->
<!--                  <q-card-section>Tasdiqni kutayotgan mahsulotlar:</q-card-section>-->
<!--                </template>-->
<!--                <template v-slot:after>-->
<!--                  <q-card-section><span class="text-green">? +</span> {{ cutModelsPendingData.value?.total || 0 }}</q-card-section>-->
<!--                </template>-->
<!--              </q-splitter>-->
<!--              <q-separator inset />-->
<!--            </div>-->
<!--            <div>-->
<!--              <q-splitter v-model="splitterModel">-->
<!--                <template v-slot:before>-->
<!--                  <q-card-section>Bichilgan brag mahsulotlar:</q-card-section>-->
<!--                </template>-->
<!--                <template v-slot:after>-->
<!--                  <q-card-section>{{ cutModelsDefectAcceptedData.value?.total || 0 }}</q-card-section>-->
<!--                </template>-->
<!--              </q-splitter>-->
<!--              <q-separator inset />-->
<!--            </div>-->
<!--            <div>-->
<!--              <q-splitter v-model="splitterModel">-->
<!--                <template v-slot:before>-->
<!--                  <q-card-section> Tasdiqni kutayotgan brag mahsulotlar:</q-card-section>-->
<!--                </template>-->
<!--                <template v-slot:after>-->
<!--                  <q-card-section><span class="text-green">? +</span> {{ cutModelsDefectPendingData.value?.total || 0 }}</q-card-section>-->
<!--                </template>-->
<!--              </q-splitter>-->
<!--              <q-separator inset />-->
<!--            </div>-->
<!--          </q-card>-->
<!--        </q-expansion-item>-->
<!--        <q-card-section>-->
<!--          <div class="text-bold">Vishivkaga Qabul qilindi -> {{ embroideryAcceptedMovementsStats.total }} {{ embroideryPendingMovementsStats.total ? `(+ Kutilmoqda: ${embroideryPendingMovementsStats.total})` : ''  }}</div>-->
<!--          <div class="text-bold">Tikuvga o'tdi -> {{ sewAcceptedMovementsStats.total }} {{ sewPendingMovementsStats.total ? `(+ Kutilmoqda: ${sewPendingMovementsStats.total})` : ''  }}</div>-->
<!--        </q-card-section>-->
<!--      </q-card>-->
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
  </q-stepper>
</template>
