<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialOrder } from "stores/ripeMaterialOrder.js";
import PaintTable from "components/tables/PaintTable.vue";
import PaintCompletedTable from "components/tables/PaintCompletedTable.vue";

const tab = ref('orders');

const order = useRipeMaterialOrder();
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
const completedTotal = ref(0);
const completedLoading = ref(false);
const completedPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedPagesNumber = computed(() => Math.ceil(completedTotal.value / completedPagination.value.rowsPerPage));

function getOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'expected';

  loading.value = true;
  order.fetchRipeMaterialOrder(props || '')
    .then((res) => {
      orders.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}
function getCompletedOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'accepted';

  completedLoading.value = true;
  order.fetchRipeMaterialOrder(props || '')
    .then((res) => {
      completedOrders.value = res.data['hydra:member'];
      completedTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedLoading.value = false;
    });
}

function refresh() {
  pagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  completedPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
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
        <q-badge v-if="total" color="red" floating>{{ total }}</q-badge>
      </q-tab>
      <q-tab name="completedOrders" :label="$t('completedOrders')" />
    </q-tabs>
    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>
  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="orders" class="q-pa-none">
        <paint-table
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
        <paint-completed-table
          :orders="completedOrders"
          :pagination="completedPagination"
          :loading="completedLoading"
          @submit="refresh"
        />
        <div
          v-if="completedTotal > completedPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="loading"
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
