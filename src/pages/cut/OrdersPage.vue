<script setup>
import { computed, onMounted, ref } from "vue";
import { useProductModelOrder } from "stores/productModelOrder.js";
import ProductModelOrderTable from "components/tables/ProductModelOrderTable.vue";
import RefreshButton from "components/RefreshButton.vue";

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
function refresh() {
  orderPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  getOrders();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
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
</template>
