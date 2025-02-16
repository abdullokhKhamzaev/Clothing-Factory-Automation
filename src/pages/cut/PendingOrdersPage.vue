<script setup>
import { computed, onMounted, ref } from "vue";
import { useProductModelOrderCompleted } from "stores/productModelOrderCompleted.js";
import CompletedProductModelOrderTable from "components/tables/CompletedProductModelOrderTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const completedPendingOrders = ref([]);
const completedPendingTotal = ref(0);
const completedPendingLoading = ref(false);
const completedPendingPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedPendingPagesNumber = computed(() => Math.ceil(completedPendingTotal.value / completedPendingPagination.value.rowsPerPage));
function getCompletedPendingOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'pending'

  completedPendingLoading.value = true;
  useProductModelOrderCompleted().getOrders(props || '')
    .then((res) => {
      completedPendingOrders.value = res.data['hydra:member'];
      completedPendingTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedPendingLoading.value = false;
    });
}
function refresh() {
  completedPendingPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getCompletedPendingOrders();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <completed-product-model-order-table
    :orders="completedPendingOrders"
    :pagination="completedPendingPagination"
    :loading="completedPendingLoading"
    @submit="refresh"
  />
  <div
    v-if="completedPendingTotal > completedPendingPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="completedPendingLoading"
      v-model="completedPendingPagination.page"
      input-class="text-bold text-black"
      :max="completedPendingPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getCompletedPendingOrders({ page: completedPendingPagination.page })"
    />
  </div>
</template>
