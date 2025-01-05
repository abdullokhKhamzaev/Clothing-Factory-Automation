<script setup>
import { onMounted, ref } from "vue";
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

const completedNotAcceptedUnripeMaterialOrder = useCompletedUnripeMaterialOrders();
const completedNotAcceptedUnripeMaterialOrders = ref([]);
const completedNotAcceptedUnripeMaterialOrderTotal = ref(0);
const completedNotAcceptedUnripeMaterialOrderLoading = ref(false);

const completedOrders = ref([]);
const completedOrdersTotal = ref(0);
const completedOrdersLoading = ref(false);

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

function refresh (filteredProps) {
  getOrders(filteredProps);
  getNotAcceptedCompletedUnripeMaterialOrders(filteredProps);
  getCompletedOrders(filteredProps);
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
          :total="total"
          :loading="loading"
          @submit="refresh"
        />
      </q-tab-panel>
      <q-tab-panel name="pending" class="q-pa-none">
        <completed-unripe-material-order-table
          :orders="completedNotAcceptedUnripeMaterialOrders"
          :total="completedNotAcceptedUnripeMaterialOrderTotal"
          :loading="completedNotAcceptedUnripeMaterialOrderLoading"
          @submit="refresh"
        />
      </q-tab-panel>
      <q-tab-panel name="completedOrders" class="q-pa-none">
        <unripe-material-order-completed-table
          :orders="completedOrders"
          :total="completedOrdersTotal"
          :loading="completedOrdersLoading"
          @submit="refresh"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
