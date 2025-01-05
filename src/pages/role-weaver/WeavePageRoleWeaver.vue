<script setup>
import { onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import UnripeMaterialOrderRoleWeaverTable from "components/tables/role-weaver/UnripeMaterialOrderRoleWeaverTable.vue";
import CompletedUnripeMaterialOrderTableRoleWeaver from "components/tables/role-weaver/CompletedUnripeMaterialOrderTableRoleWeaver.vue";

const tab = ref('orders')

const order = useUnripeMaterialOrder();
const orders = ref([]);
const total = ref(0);
const loading = ref(false);

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

function refresh(filteredProps) {
  getOrders(filteredProps)
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
          :total="total"
          :loading="loading"
          @submit="refresh"
        />
      </q-tab-panel>
      <q-tab-panel name="completedOrders" class="q-pa-none">
        <completed-unripe-material-order-table-role-weaver />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
