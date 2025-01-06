<script setup>
import {computed, onMounted, ref} from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import UnripeMaterialOrderRoleWeaverTable from "components/tables/role-weaver/UnripeMaterialOrderRoleWeaverTable.vue";
import CompletedUnripeMaterialOrderTableRoleWeaver from "components/tables/role-weaver/CompletedUnripeMaterialOrderTableRoleWeaver.vue";

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

async function getOrders (filterProps) {
  let props = filterProps || {};

  props.statuses = ['confirmed', 'pending']

  loading.value = true;
  await order.fetchUnripeMaterialOrder(props || '')
    .then((res) => {
      orders.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}
async function getCompletedOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'completed'

  completedOrdersLoading.value = true;
  await order.fetchUnripeMaterialOrder(props || '')
    .then((res) => {
      completedOrders.value = res.data['hydra:member'];
      completedOrdersTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedOrdersLoading.value = false;
    });
}

async function refresh() {
  pagination.value = {
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
  await getOrders();
  await getCompletedOrders();
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
      <q-tab name="completedOrders" :label="$t('completedOrders')" />
    </q-tabs>

    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>

  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="orders" class="q-pa-none">
        <unripe-material-order-role-weaver-table
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
      <q-tab-panel name="completedOrders" class="q-pa-none">
        <completed-unripe-material-order-table-role-weaver
          :orders="completedOrders"
          :pagination="completedPagination"
          :loading="completedOrdersLoading"
        />
        <div
          v-if="completedOrdersTotal > completedPagination.rowsPerPage"
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
