<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialOrderAccept } from "stores/ripeMaterialOrderAccept.js";
import RipeMaterialPaintPurchaseTable from "components/tables/RipeMaterialPaintPurchaseTable.vue";

import RefreshButton from "components/RefreshButton.vue";
const ripeMaterialPaintPurchase = useRipeMaterialOrderAccept();
const ripeMaterialPaintPurchases = ref([]);
const ripeMaterialPaintPurchaseTotal = ref([]);
const ripeMaterialPaintPurchaseLoading = ref(false);
const ripeMaterialPaintPurchasePagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const ripeMaterialPaintPurchasePagesNumber = computed(() => Math.ceil(ripeMaterialPaintPurchaseTotal.value / ripeMaterialPaintPurchasePagination.value.rowsPerPage));
function getRipeMaterialPaintPurchases (filterProps) {
  let props = filterProps || {};

  ripeMaterialPaintPurchaseLoading.value = true;

  ripeMaterialPaintPurchase.fetchPurchases(props || '')
    .then((res) => {
      ripeMaterialPaintPurchases.value = res.data['hydra:member'];
      ripeMaterialPaintPurchaseTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      ripeMaterialPaintPurchaseLoading.value = false;
    });
}
function refresh () {
  ripeMaterialPaintPurchasePagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getRipeMaterialPaintPurchases();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <ripe-material-paint-purchase-table
    :purchases="ripeMaterialPaintPurchases"
    :pagination="ripeMaterialPaintPurchasePagination"
    :loading="ripeMaterialPaintPurchaseLoading"
    @refresh="refresh"
  />
  <div
    v-if="ripeMaterialPaintPurchaseTotal > ripeMaterialPaintPurchasePagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="ripeMaterialPaintPurchaseLoading"
      v-model="ripeMaterialPaintPurchasePagination.page"
      input-class="text-bold text-black"
      :max="ripeMaterialPaintPurchasePagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getRipeMaterialPaintPurchases({ page: ripeMaterialPaintPurchasePagination.page })"
    />
  </div>
</template>

<style scoped>
</style>
