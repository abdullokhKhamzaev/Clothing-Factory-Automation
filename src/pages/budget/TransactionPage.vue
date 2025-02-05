<script setup>
import { computed, onMounted, ref } from "vue";
import { useTransaction } from 'src/stores/transaction.js'
import TransactionTable from "components/tables/TransactionTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const transaction = useTransaction();
const transactions = ref([]);
const transactionTotal = ref([]);
const transactionLoading = ref(false);
const transactionPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const transactionPagesNumber = computed(() => Math.ceil(transactionTotal.value / transactionPagination.value.rowsPerPage));
function getTransactions (filterProps) {
  let props = filterProps || {};

  transactionLoading.value = true;

  transaction.fetchTransactions(props || '')
    .then((res) => {
      transactions.value = res.data['hydra:member'];
      transactionTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      transactionLoading.value = false;
    });
}
function refresh () {
  transactionPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getTransactions();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <transaction-table
    :transactions="transactions"
    :pagination="transactionPagination"
    :loading="transactionLoading"
  />
  <div
    v-if="transactionTotal > transactionPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="transactionLoading"
      v-model="transactionPagination.page"
      input-class="text-bold text-black"
      :max="transactionPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getTransactions({ page: transactionPagination.page })"
    />
  </div>
</template>

<style scoped>
</style>
