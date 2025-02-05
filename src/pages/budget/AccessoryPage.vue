<script setup>
import { computed, onMounted, ref } from "vue";
import { useAccessoryPurchase } from "src/stores/accessoryPurchase.js";
import AccessoryPurchaseTable from "components/tables/AccessoryPurchaseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const accessoryPurchase = useAccessoryPurchase();
const accessoryPurchases = ref([]);
const accessoryPurchaseTotal = ref([]);
const accessoryPurchaseLoading = ref(false);
const accessoryPurchasePagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const accessoryPurchasePagesNumber = computed(() => Math.ceil(accessoryPurchaseTotal.value / accessoryPurchasePagination.value.rowsPerPage));
function getAccessoryPurchases (filterProps) {
  let props = filterProps || {};

  accessoryPurchaseLoading.value = true;

  accessoryPurchase.fetchPurchases(props || '')
    .then((res) => {
      accessoryPurchases.value = res.data['hydra:member'];
      accessoryPurchaseTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      accessoryPurchaseLoading.value = false;
    });
}
function refresh () {
  accessoryPurchasePagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getAccessoryPurchases();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <accessory-purchase-table
    :purchases="accessoryPurchases"
    :pagination="accessoryPurchasePagination"
    :loading="accessoryPurchaseLoading"
  />
  <div
    v-if="accessoryPurchaseTotal > accessoryPurchasePagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="accessoryPurchaseLoading"
      v-model="accessoryPurchasePagination.page"
      input-class="text-bold text-black"
      :max="accessoryPurchasePagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getAccessoryPurchases({ page: accessoryPurchasePagination.page })"
    />
  </div>
</template>
<style scoped>
</style>
