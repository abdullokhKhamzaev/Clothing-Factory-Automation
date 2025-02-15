<script setup>
import { computed, onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import UnripeMaterialOrderCompletedTable from "components/tables/UnripeMaterialOrderCompletedTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const order = useUnripeMaterialOrder();
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
  completedPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getCompletedOrders();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <unripe-material-order-completed-table
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
</template>
