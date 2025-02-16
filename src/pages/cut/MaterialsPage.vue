<script setup>
import { computed, onMounted, ref } from "vue";
import { useCutterRipeMaterialWarehouse } from "stores/cutterRipeMaterialWarehouse.js";
import CutterRipeMaterialWarehouseTable from "components/tables/CutterRipeMaterialWarehouseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const ripeMaterials = ref([]);
const ripeMaterialTotal = ref(0);
const ripeMaterialLoading = ref(false);
const ripeMaterialPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const ripeMaterialPagesNumber = computed(() => Math.ceil(ripeMaterialTotal.value / ripeMaterialPagination.value.rowsPerPage));
function getRipeMaterial (filterProps) {
  let props = filterProps || {};

  ripeMaterialLoading.value = true;
  useCutterRipeMaterialWarehouse().getAll(props || '')
    .then((res) => {
      ripeMaterials.value = res.data['hydra:member'];
      ripeMaterialTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      ripeMaterialLoading.value = false;
    });
}
function refresh() {
  ripeMaterialPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getRipeMaterial();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <cutter-ripe-material-warehouse-table
    :materials="ripeMaterials"
    :pagination="ripeMaterialPagination"
    :loading="ripeMaterialLoading"
    @submit="refresh"
  />
  <div
    v-if="ripeMaterialTotal > ripeMaterialPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="ripeMaterialLoading"
      v-model="ripeMaterialPagination.page"
      input-class="text-bold text-black"
      :max="ripeMaterialPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getRipeMaterial({ page: ripeMaterialPagination.page })"
    />
  </div>
</template>
