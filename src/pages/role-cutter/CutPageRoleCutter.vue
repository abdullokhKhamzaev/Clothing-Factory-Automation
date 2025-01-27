<script setup>
import { computed, onMounted, ref } from "vue";
import { useCutterRipeMaterialWarehouse } from "stores/cutterRipeMaterialWarehouse.js";
import { useProductModelOrder } from "stores/productModelOrder.js";
import ProductModelOrderRoleCutterTable from "components/tables/role-cutter/ProductModelOrderRoleCutterTable.vue";
import MaterialWarehouseRoleCutterTable from "components/tables/role-cutter/MaterialWarehouseRoleCutterTable.vue";
import ProductModelOrderCompletedTable from "components/ProductModelOrderCompletedTable.vue";

const tab = ref('orders');

const ripeMaterials = ref([]);
const ripeMaterialTotal = ref(0);
const ripeMaterialLoading = ref(false);
const ripeMaterialPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const ripeMaterialPagesNumber = computed(() => Math.ceil(ripeMaterialTotal.value / ripeMaterialPagination.value.rowsPerPage));
function getRipeMaterial (filterProps) {
  let props = filterProps || {};

  ripeMaterialLoading.value = true;
  useCutterRipeMaterialWarehouse().getAll(props || '')
    .then((res) => {
      ripeMaterials.value = res.data['hydra:member'];
      ripeMaterialTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      ripeMaterialLoading.value = false;
    });
}

const orders = ref([]);
const orderTotal = ref(0);
const orderLoading = ref(false);
const orderPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const orderPagesNumber = computed(() => Math.ceil(orderTotal.value / orderPagination.value.rowsPerPage));

const completedOrders = ref([]);
const completedTotal = ref(0);
const completedLoading = ref(false);
const completedPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedPagesNumber = computed(() => Math.ceil(completedTotal.value / completedPagination.value.rowsPerPage));
function getCompletedOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'completed';

  completedLoading.value = true;
  useProductModelOrder().fetchOrders(props || '')
    .then((res) => {
      completedOrders.value = res.data['hydra:member'];
      completedTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedLoading.value = false;
    });
}

function getOrders (filterProps) {
  let props = filterProps || {};

  props.statuses = ['confirmed', 'pending']

  orderLoading.value = true;
  useProductModelOrder().fetchOrders(props || '')
    .then((res) => {
      orders.value = res.data['hydra:member'];
      orderTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      orderLoading.value = false;
    });
}

function refresh() {
  ripeMaterialPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  orderPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  getRipeMaterial();
  getOrders();
  getCompletedOrders();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="flex justify-between q-gutter-md">
    <q-tabs
      v-model="tab"
      no-caps
      dense
      outside-arrows
      mobile-arrows
      class="shadow-2 text-primary"
      :class="$q.screen.xs ? 'full-width' : ''"
    >
      <q-tab name="orders" :label="$t('orders')">
        <q-badge v-if="orderTotal" color="red" floating>{{ orderTotal }}</q-badge>
      </q-tab>
      <q-tab name="completedOrders" :label="$t('completedOrders')" />
      <q-tab name="materials" :label="$t('materials')" />
    </q-tabs>
    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>
  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="orders" class="q-pa-none">
        <product-model-order-role-cutter-table
          :orders="orders"
          :pagination="orderPagination"
          :loading="orderLoading"
          @submit="refresh"
        />
        <div
          v-if="orderTotal > orderPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="orderLoading"
            v-model="orderPagination.page"
            input-class="text-bold text-black"
            :max="orderPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getOrders({ page: orderPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="completedOrders" class="q-pa-none">
        <product-model-order-completed-table
          :orders="completedOrders"
          :pagination="completedPagination"
          :loading="completedLoading"
        />
        <div
          v-if="completedTotal > completedPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="completedLoading"
            v-model="completedPagination.page"
            input-class="text-bold text-black"
            :max="completedPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getCompletedOrders({ page: completedPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="materials" class="q-pa-none">
        <material-warehouse-role-cutter-table
          :materials="ripeMaterials"
          :pagination="ripeMaterialPagination"
          :loading="ripeMaterialLoading"
          @submit="refresh"
        />
        <div
          v-if="ripeMaterialTotal > ripeMaterialPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="ripeMaterialLoading"
            v-model="ripeMaterialPagination.page"
            input-class="text-bold text-black"
            :max="ripeMaterialPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getRipeMaterial({ page: ripeMaterialPagination.page })"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
