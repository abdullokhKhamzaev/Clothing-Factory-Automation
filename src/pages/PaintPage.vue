<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialOrder } from "stores/ripeMaterialOrder.js";
import { useRipeMaterialRepaint } from "stores/ripeMaterialRepaint.js";
import PaintTable from "components/tables/PaintTable.vue";
import PaintCompletedTable from "components/tables/PaintCompletedTable.vue";
import RepaintTable from "components/tables/RepaintTable.vue";
import CompletedRepaintTable from "components/tables/CompletedRepaintTable.vue";

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

const repaintOrder = useRipeMaterialRepaint();
const repaintOrders = ref([]);
const repaintTotal = ref(0);
const repaintLoading = ref(false);
const repaintPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const repaintPagesNumber = computed(() => Math.ceil(repaintTotal.value / repaintPagination.value.rowsPerPage));
function getRepaintOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'expected';

  repaintLoading.value = true;
  repaintOrder.fetchRepaintOrders(props || '')
    .then((res) => {
      repaintOrders.value = res.data['hydra:member'];
      repaintTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      repaintLoading.value = false;
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

const completedRepaintOrders = ref([]);
const completedRepaintTotal = ref(0);
const completedRepaintLoading = ref(false);
const completedRepaintPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedRepaintPagesNumber = computed(() => Math.ceil(completedRepaintTotal.value / completedRepaintPagination.value.rowsPerPage));
function getCompletedRepaintOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'received';

  completedRepaintLoading.value = true;
  repaintOrder.fetchRepaintOrders(props || '')
    .then((res) => {
      completedRepaintOrders.value = res.data['hydra:member'];
      completedRepaintTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedRepaintLoading.value = false;
    });
}

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

function refresh() {
  pagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  repaintPagination.value = {
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
  completedRepaintPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  getOrders();
  getRepaintOrders();
  getCompletedOrders();
  getCompletedRepaintOrders();
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
      <q-tab name="repaintOrders" :label="$t('repaintOrders')" />
      <q-tab name="completedOrders" :label="$t('completedOrders')" />
      <q-tab name="completedRepaintOrders" :label="$t('completedRepaintOrders')" />
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
      <q-tab-panel name="repaintOrders" class="q-pa-none">
        <repaint-table
          :orders="repaintOrders"
          :pagination="repaintPagination"
          :loading="repaintLoading"
          @submit="refresh"
        />
        <div
          v-if="repaintTotal > repaintPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="repaintLoading"
            v-model="repaintPagination.page"
            input-class="text-bold text-black"
            :max="repaintPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getRepaintOrders({ page: repaintPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="completedOrders" class="q-pa-none">
        <paint-completed-table
          :orders="completedOrders"
          :pagination="completedPagination"
          :loading="completedLoading"
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
      <q-tab-panel name="completedRepaintOrders" class="q-pa-none">
        <completed-repaint-table
          :orders="completedRepaintOrders"
          :pagination="completedRepaintPagination"
          :loading="completedRepaintLoading"
        />
        <div
          v-if="completedRepaintTotal > completedRepaintPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="completedRepaintLoading"
            v-model="completedRepaintPagination.page"
            input-class="text-bold text-black"
            :max="completedRepaintPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getCompletedRepaintOrders({ page: completedRepaintPagination.page })"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
