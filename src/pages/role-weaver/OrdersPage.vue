<script setup>
import { computed, onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import UnripeMaterialOrderRoleWeaverTable from "components/tables/role-weaver/UnripeMaterialOrderRoleWeaverTable.vue";
import RefreshButton from "components/RefreshButton.vue";

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
async function refresh() {
  pagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  await getOrders();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
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
</template>
