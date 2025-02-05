<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialPurchase } from "stores/ripeMaterialPurchase.js";
import RipeMaterialPurchaseTable from "components/tables/RipeMaterialPurchaseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const ripeMaterialPurchase = useRipeMaterialPurchase();
const ripeMaterialPurchases = ref([]);
const ripeMaterialPurchaseTotal = ref([]);
const ripeMaterialPurchaseLoading = ref(false);
const ripeMaterialPurchasePagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const ripeMaterialPurchasePagesNumber = computed(() => Math.ceil(ripeMaterialPurchaseTotal.value / ripeMaterialPurchasePagination.value.rowsPerPage));
function getRipeMaterialPurchases (filterProps) {
  let props = filterProps || {};

  ripeMaterialPurchaseLoading.value = true;

  ripeMaterialPurchase.fetchPurchases(props || '')
    .then((res) => {
      ripeMaterialPurchases.value = res.data['hydra:member'];
      ripeMaterialPurchaseTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      ripeMaterialPurchaseLoading.value = false;
    });
}
function refresh () {
  ripeMaterialPurchasePagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getRipeMaterialPurchases();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <ripe-material-purchase-table
    :purchases="ripeMaterialPurchases"
    :pagination="ripeMaterialPurchasePagination"
    :loading="ripeMaterialPurchaseLoading"
    @refresh="refresh"
  />
  <div
    v-if="ripeMaterialPurchaseTotal > ripeMaterialPurchasePagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="ripeMaterialPurchaseLoading"
      v-model="ripeMaterialPurchasePagination.page"
      input-class="text-bold text-black"
      :max="ripeMaterialPurchasePagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getRipeMaterialPurchases({ page: ripeMaterialPurchasePagination.page })"
    />
  </div>
</template>

<style scoped>
</style>
