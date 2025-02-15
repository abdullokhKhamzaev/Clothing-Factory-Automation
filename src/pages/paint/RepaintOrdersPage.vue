<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialRepaint } from "stores/ripeMaterialRepaint.js";
import RepaintTable from "components/tables/RepaintTable.vue";
import RefreshButton from "components/RefreshButton.vue";

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

function refresh() {
  repaintPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  }
  getRepaintOrders();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
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
</template>
