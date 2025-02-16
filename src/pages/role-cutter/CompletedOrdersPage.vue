<script setup>
import { computed, onMounted, ref } from "vue";
import { useProductModelOrder } from "stores/productModelOrder.js";
import CompletedProductModelOrderRoleCutterTable from "components/tables/role-cutter/CompletedProductModelOrderRoleCutterTable.vue";
import RefreshButton from "components/RefreshButton.vue";

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

  props.status = 'completed';

  completedLoading.value = true;
  useProductModelOrder().fetchOrders(props || '')
    .then((res) => {
      completedOrders.value = res.data['hydra:member'];
      completedTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedLoading.value = false;
    });
}
function refresh() {
  completedPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getCompletedOrders();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <completed-product-model-order-role-cutter-table
    :orders="completedOrders"
    :pagination="completedPagination"
    :loading="completedLoading"
  />
  <div
    v-if="completedTotal > completedPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="completedLoading"
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
