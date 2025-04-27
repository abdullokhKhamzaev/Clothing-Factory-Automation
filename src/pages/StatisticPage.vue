<script setup>
import {computed, onMounted, ref} from "vue";
import {DATE_FORMAT} from "src/libraries/constants/defaults.js";
import {useProductWarehouse} from "stores/productInWarehouseAction.js";
import RefreshButton from "components/RefreshButton.vue";

const splitterModel = ref(50);
const dateFrom = ref(new Date().toISOString().split('T')[0]);
const dateTo = ref(new Date().toISOString().split('T')[0]);
const productWarehouse = '/api/warehouses/9';
const sewWarehouse = '/api/warehouses/7';
const packagerReadyWarehouse = '/api/warehouses/8';

const sewWarehouseActions = ref();
const sewWarehouseLoading = ref(false);

const packageWarehouseActions = ref();
const packageWarehouseLoading = ref(false);

const productWarehouseActions = ref();
const productWarehouseLoading = ref(false);

function getProductWarehouseAction (filterProps) {
  productWarehouseLoading.value = true;
  let props = filterProps || {};

  props.toWarehouse = productWarehouse;
  props.receivedAtFrom = dateFrom.value + 'T00:00:00';
  props.receivedAtTo = dateTo.value + 'T23:59:59';
  props.noPagination = true;

  useProductWarehouse().getAll(props || '')
    .then((res) => {
      productWarehouseActions.value = res.data['hydra:member'];
    })
    .finally(() => {
      productWarehouseLoading.value = false;
    });
}
function getPackageWarehouseAction (filterProps) {
  packageWarehouseLoading.value = true;
  let props = filterProps || {};

  props.toWarehouse = packagerReadyWarehouse;
  props.receivedAtFrom = dateFrom.value + 'T00:00:00';
  props.receivedAtTo = dateTo.value + 'T23:59:59';
  props.noPagination = true;

  useProductWarehouse().getAll(props || '')
    .then((res) => {
      packageWarehouseActions.value = res.data['hydra:member'];
    })
    .finally(() => {
      packageWarehouseLoading.value = false;
    });
}
function getSewWarehouseAction (filterProps) {
  sewWarehouseLoading.value = true;
  let props = filterProps || {};

  props.toWarehouse = sewWarehouse;
  props.receivedAtFrom = dateFrom.value + 'T00:00:00';
  props.receivedAtTo = dateTo.value + 'T23:59:59';
  props.noPagination = true;

  useProductWarehouse().getAll(props || '')
    .then((res) => {
      sewWarehouseActions.value = res.data['hydra:member'];
    })
    .finally(() => {
      sewWarehouseLoading.value = false;
    });
}

function refresh() {
  getProductWarehouseAction();
  getPackageWarehouseAction();
  getSewWarehouseAction();
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

const productStats = computed(() => getStats(productWarehouseActions.value));
const sewStats = computed(() => getStats(sewWarehouseActions.value));
const packageStats = computed(() => getStats(packageWarehouseActions.value));

onMounted(() => {
  refresh();
});
</script>


<template>
  <div class="flex justify-between q-card q-mb-md q-pa-sm">
    <q-btn outline icon="event" :label="dateFrom" color="primary">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="dateFrom" :mask="DATE_FORMAT" @update:model-value="refresh">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Close" color="primary" flat />
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>

    <q-btn outline icon="event" :label="dateTo" color="primary">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="dateTo" :mask="DATE_FORMAT" @update:model-value="refresh">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Close" color="primary" flat />
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>
  </div>

  <div class="row q-col-gutter-md">
    <div class="col-12">
      <q-card flat bordered class="q-pa-sm">
        <q-card-section class="flex justify-between">
          <div class="text-h6 text-primary">Tikilgan mahsulotlar:</div>
          <refresh-button dense :action="getSewWarehouseAction" />
        </q-card-section>

        <q-linear-progress v-if="sewWarehouseLoading" indeterminate color="primary" />
        <q-separator v-else />

        <div v-for="(count, modelName) in sewStats.stats" :key="modelName">
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

        <q-card-section>
          <div class="text-bold">Jami: {{ sewStats.total }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12">
      <q-card flat bordered class="q-pa-sm">
        <q-card-section class="flex justify-between">
          <div class="text-h6 text-primary">Qadoqlangan mahsulotlar:</div>
          <refresh-button dense :action="getPackageWarehouseAction" />
        </q-card-section>

        <q-linear-progress v-if="packageWarehouseLoading" indeterminate color="primary" />
        <q-separator v-else />

        <div v-for="(count, modelName) in packageStats.stats" :key="modelName">
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

        <q-card-section>
          <div class="text-bold">Jami: {{ packageStats.total }}</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12">
      <q-card flat bordered class="q-pa-sm">
        <q-card-section class="flex justify-between">
          <div class="text-h6 text-primary">Qabul qilingan mahsulotlar:</div>
          <refresh-button dense :action="getProductWarehouseAction" />
        </q-card-section>

        <q-linear-progress v-if="productWarehouseLoading" indeterminate color="primary" />
        <q-separator v-else />

        <div v-for="(count, modelName) in productStats.stats" :key="modelName">
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

        <q-card-section>
          <div class="text-bold">Jami: {{ productStats.total }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

