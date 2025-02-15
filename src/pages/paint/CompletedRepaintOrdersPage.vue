<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialRepaint } from "stores/ripeMaterialRepaint.js";
import CompletedRepaintTable from "components/tables/CompletedRepaintTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const repaintOrder = useRipeMaterialRepaint();
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
function refresh() {
  completedRepaintPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  getCompletedRepaintOrders();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
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
</template>
