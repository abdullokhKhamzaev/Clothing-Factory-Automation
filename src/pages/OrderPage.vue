<script setup>
import { computed, onMounted, ref } from "vue";
import { useOrder } from "stores/order.js";
import RefreshButton from "components/RefreshButton.vue";
import OrderTable from "components/tables/OrderTable.vue";

const order = useOrder();
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

const filters = ref({})

function getOrders (filterProps) {
  orderLoading.value = true;

  order.fetchOrders(filterProps || filters.value)
    .then((res) => {
      orders.value = res.data['hydra:member'];
      orderTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      orderLoading.value = false;
    });
}

function refresh (props) {
  if (props) {
    Object.assign(filters.value, props);
  }

  orderPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getOrders();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <order-table
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
      @update:model-value="getOrders({ ...filters, page: orderPagination.page })"
    />
  </div>
</template>
