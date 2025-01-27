<script setup>
import { computed, onMounted, ref } from "vue";
import { useCutterRipeMaterialWarehouse } from "stores/cutterRipeMaterialWarehouse.js";
import { useProductModelOrder } from "stores/productModelOrder.js";
import { useProductModelOrderCompleted } from "stores/productModelOrderCompleted.js";
import { useWarehouse } from "stores/warehouse.js";
import CutterRipeMaterialWarehouseTable from "components/tables/CutterRipeMaterialWarehouseTable.vue";
import ProductModelOrderTable from "components/tables/ProductModelOrderTable.vue";
import CompletedProductModelOrderTable from "components/tables/CompletedProductModelOrderTable.vue";
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
function getOrders (filterProps) {
  let props = filterProps || {};

  props.statuses = ['pending', 'confirmed']

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

const completedPendingOrders = ref([]);
const completedPendingTotal = ref(0);
const completedPendingLoading = ref(false);
const completedPendingPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedPendingPagesNumber = computed(() => Math.ceil(completedPendingTotal.value / completedPendingPagination.value.rowsPerPage));
function getCompletedPendingOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'pending'

  completedPendingLoading.value = true;
  useProductModelOrderCompleted().getOrders(props || '')
    .then((res) => {
      completedPendingOrders.value = res.data['hydra:member'];
      completedPendingTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedPendingLoading.value = false;
    });
}

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

const warehouses = ref([]);
function getWarehouse (filterProps) {
  let props = filterProps || {};

  props.name = 'cutterWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouses.value = res.data['hydra:member'];
    })
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
  getOrders();
  getCompletedPendingOrders();
  getCompletedOrders();
  getRipeMaterial();
  getWarehouse();
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
      <q-tab name="orders" :label="$t('orders')" />
      <q-tab name="pending" :label="$t('pending')">
        <q-badge v-if="completedPendingTotal" color="red" floating>{{ completedTotal }}</q-badge>
      </q-tab>
      <q-tab name="completedOrders" :label="$t('completedOrders')" />
      <q-tab name="materials" :label="$t('materials')" />
      <q-tab name="warehouse" :label="$t('warehouse')" />
    </q-tabs>
    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>
  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="orders" class="q-pa-none">
        <product-model-order-table
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
      <q-tab-panel name="pending" class="q-pa-none">
        <completed-product-model-order-table
          :orders="completedPendingOrders"
          :pagination="completedPendingPagination"
          :loading="completedPendingLoading"
          @submit="refresh"
        />
        <div
          v-if="completedPendingTotal > completedPendingPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="completedPendingLoading"
            v-model="completedPendingPagination.page"
            input-class="text-bold text-black"
            :max="completedPendingPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getCompletedPendingOrders({ page: completedPendingPagination.page })"
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
        <cutter-ripe-material-warehouse-table
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
      <q-tab-panel name="warehouse" class="q-pa-none">
        <q-list bordered separator>
          <q-item
            v-for="item in warehouses[0].productInWarehouses"
            :key="item"
          >
            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bold">{{ item.productModel.name }}</q-item-label>
              <q-item-label caption>
                <span
                  v-for="size in item.productSize"
                  :key="size"
                  class="q-pl-xs text-primary text-subtitle2 text-weight-bold"
                >
                  {{ size.size }} : {{ size.quantity }},
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section>
              <div class="flex justify-end">
                <q-btn size="md" color="primary" rounded dense icon='edit'>
                  <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                    {{ $t('edit') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
