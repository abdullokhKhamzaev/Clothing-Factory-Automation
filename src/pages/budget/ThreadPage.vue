<script setup>
import { computed, onMounted, ref } from "vue";
import { useThreadPurchase } from 'src/stores/threadPurchase.js'
import ThreadPurchaseTable from "components/tables/ThreadPurchaseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const threadPurchase = useThreadPurchase();
const threadPurchases = ref([]);
const threadPurchaseTotal = ref([]);
const threadPurchaseLoading = ref(false);
const threadPurchasePagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const threadPurchasePagesNumber = computed(() => Math.ceil(threadPurchaseTotal.value / threadPurchasePagination.value.rowsPerPage));
function getThreadPurchases (filterProps) {
  let props = filterProps || {};

  threadPurchaseLoading.value = true;

  threadPurchase.fetchPurchases(props || '')
    .then((res) => {
      threadPurchases.value = res.data['hydra:member'];
      threadPurchaseTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      threadPurchaseLoading.value = false;
    });
}
function refresh () {
  threadPurchasePagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getThreadPurchases();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <thread-purchase-table
    :purchases="threadPurchases"
    :pagination="threadPurchasePagination"
    :loading="threadPurchaseLoading"
    @refresh="refresh"
  />
  <div
    v-if="threadPurchaseTotal > threadPurchasePagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="threadPurchaseLoading"
      v-model="threadPurchasePagination.page"
      input-class="text-bold text-black"
      :max="threadPurchasePagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getThreadPurchases({ page: threadPurchasePagination.page })"
    />
  </div>
</template>
<style scoped>
</style>
