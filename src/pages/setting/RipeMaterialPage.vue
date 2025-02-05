<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import RipeMaterialTable from "components/tables/RipeMaterialTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const ripeMaterial = useRipeMaterial();
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
function getRipeMaterials (filterProps) {
  let props = filterProps || {};
  ripeMaterialLoading.value = true;

  ripeMaterial.fetchRipeMaterials(props || '')
    .then((res) => {
      ripeMaterials.value = res.data['hydra:member'];
      ripeMaterialTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      ripeMaterialLoading.value = false;
    });
}
 function refresh () {
   ripeMaterialPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getRipeMaterials();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <ripe-material-table
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
      @update:model-value="getRipeMaterials({ page: ripeMaterialPagination.page })"
    />
  </div>
</template>
