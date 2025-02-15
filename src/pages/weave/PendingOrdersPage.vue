<script setup>
import { computed, onMounted, ref } from "vue";
import { useCompletedUnripeMaterialOrders } from "stores/completedUnripeMaterialOrders.js";
import CompletedUnripeMaterialOrderTable from "components/tables/CompletedUnripeMaterialOrderTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const completedNotAcceptedUnripeMaterialOrder = useCompletedUnripeMaterialOrders();
const completedNotAcceptedUnripeMaterialOrders = ref([]);
const completedNotAcceptedUnripeMaterialOrderTotal = ref(0);
const completedNotAcceptedUnripeMaterialOrderLoading = ref(false);
const completedNotAcceptedPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const completedNotAcceptedPagesNumber = computed(() => Math.ceil(completedNotAcceptedUnripeMaterialOrderTotal.value / completedNotAcceptedPagination.value.rowsPerPage));
function getNotAcceptedCompletedUnripeMaterialOrders (filterProps) {
  let props = filterProps || {};

  props.status = 'notAccepted'

  completedNotAcceptedUnripeMaterialOrderLoading.value = true;
  completedNotAcceptedUnripeMaterialOrder.fetchOrders(props || '')
    .then((res) => {
      completedNotAcceptedUnripeMaterialOrders.value = res.data['hydra:member'];
      completedNotAcceptedUnripeMaterialOrderTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      completedNotAcceptedUnripeMaterialOrderLoading.value = false;
    });
}

function refresh () {
  completedNotAcceptedPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getNotAcceptedCompletedUnripeMaterialOrders();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <completed-unripe-material-order-table
    :orders="completedNotAcceptedUnripeMaterialOrders"
    :pagination="completedNotAcceptedPagination"
    :loading="completedNotAcceptedUnripeMaterialOrderLoading"
    @submit="refresh"
  />
  <div
    v-if="completedNotAcceptedUnripeMaterialOrderTotal > completedNotAcceptedPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="completedNotAcceptedUnripeMaterialOrderLoading"
      v-model="completedNotAcceptedPagination.page"
      input-class="text-bold text-black"
      :max="completedNotAcceptedPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getNotAcceptedCompletedUnripeMaterialOrders({ page: completedNotAcceptedPagination.page })"
    />
  </div>
</template>
