<script setup>
import { computed, onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { useCompletedUnripeMaterialOrders } from "stores/completedUnripeMaterialOrders.js";
import UnripeMaterialOrderTable from "components/tables/UnripeMaterialOrderTable.vue";
import UnripeMaterialOrderCompletedTable from "components/tables/UnripeMaterialOrderCompletedTable.vue";
import CompletedUnripeMaterialOrderTable from "components/tables/CompletedUnripeMaterialOrderTable.vue";

const tab = ref('orders')

const order = useUnripeMaterialOrder();
const orders = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage));

const completedNotAcceptedUnripeMaterialOrder = useCompletedUnripeMaterialOrders();
const completedNotAcceptedUnripeMaterialOrders = ref([]);
const completedNotAcceptedUnripeMaterialOrderTotal = ref(0);
const completedNotAcceptedUnripeMaterialOrderLoading = ref(false);
const completedNotAcceptedPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedNotAcceptedPagesNumber = computed(() => Math.ceil(completedNotAcceptedUnripeMaterialOrderTotal.value / completedNotAcceptedPagination.value.rowsPerPage));

const completedOrders = ref([]);
const completedOrdersTotal = ref(0);
const completedOrdersLoading = ref(false);
const completedPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedPagesNumber = computed(() => Math.ceil(completedOrdersTotal.value / completedPagination.value.rowsPerPage));

function getOrders (filterProps) {
  let props = filterProps || {};

  props.statuses = ['confirmed', 'pending']

  loading.value = true;
  order.fetchUnripeMaterialOrder(props || '')
    .then((res) => {
      orders.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}
function getNotAcceptedCompletedUnripeMaterialOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'notAccepted'

  completedNotAcceptedUnripeMaterialOrderLoading.value = true;
  completedNotAcceptedUnripeMaterialOrder.fetchOrders(props || '')
    .then((res) => {
      completedNotAcceptedUnripeMaterialOrders.value = res.data['hydra:member'];
      completedNotAcceptedUnripeMaterialOrderTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedNotAcceptedUnripeMaterialOrderLoading.value = false;
    });
}
function getCompletedOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'completed'

  completedOrdersLoading.value = true;
  order.fetchUnripeMaterialOrder(props || '')
    .then((res) => {
      completedOrders.value = res.data['hydra:member'];
      completedOrdersTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedOrdersLoading.value = false;
    });
}

function refresh () {
  pagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  completedNotAcceptedPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  completedPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getOrders();
  getNotAcceptedCompletedUnripeMaterialOrders();
  getCompletedOrders();
}

onMounted(() => {
  refresh();
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
        <q-badge v-if="total" color="red" floating>{{ total }}</q-badge>
      </q-tab>
      <q-tab name="pending" :label="$t('pending')">
        <q-badge v-if="completedNotAcceptedUnripeMaterialOrderTotal" color="red" floating>{{ completedNotAcceptedUnripeMaterialOrderTotal }}</q-badge>
      </q-tab>
      <q-tab name="completedOrders" :label="$t('completedOrders')" />
    </q-tabs>
    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>

  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="orders" class="q-pa-none">
        <unripe-material-order-table
          :orders="orders"
          :pagination="pagination"
          :loading="loading"
          @submit="refresh"
        />
        <div
          v-if="total > pagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="loading"
            v-model="pagination.page"
            input-class="text-bold text-black"
            :max="pagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getOrders({ page: pagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="pending" class="q-pa-none">
        <completed-unripe-material-order-table
          :orders="completedNotAcceptedUnripeMaterialOrders"
          :pagination="completedNotAcceptedPagination"
          :loading="completedNotAcceptedUnripeMaterialOrderLoading"
          @submit="refresh"
        />
        <div
          v-if="completedNotAcceptedUnripeMaterialOrderTotal > completedNotAcceptedPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="completedNotAcceptedUnripeMaterialOrderLoading"
            v-model="completedNotAcceptedPagination.page"
            input-class="text-bold text-black"
            :max="completedNotAcceptedPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getNotAcceptedCompletedUnripeMaterialOrders({ page: completedNotAcceptedPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="completedOrders" class="q-pa-none">
        <unripe-material-order-completed-table
          :orders="completedOrders"
          :pagination="completedPagination"
          :loading="completedOrdersLoading"
        />
        <div
          v-if="completedNotAcceptedUnripeMaterialOrderTotal > completedNotAcceptedPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="completedOrdersLoading"
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
    </q-tab-panels>
  </div>
</template>
