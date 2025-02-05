<script setup>
import { computed, onMounted, ref } from "vue";
import { useMaterial } from "stores/material.js";
import UnripeMaterialTable from "components/tables/UnripeMaterialTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const material = useMaterial();
const materials = ref([]);
const materialTotal = ref(0);
const materialLoading = ref(false);
const materialPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const materialPagesNumber = computed(() => Math.ceil(materialTotal.value / materialPagination.value.rowsPerPage));
function getMaterials (filterProps) {
  let props = filterProps || {};
  materialLoading.value = true;

  material.fetchMaterials(props || '')
    .then((res) => {
      materials.value = res.data['hydra:member'];
      materialTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      materialLoading.value = false;
    });
}

 function refresh () {
   materialPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getMaterials();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <unripe-material-table
    :materials="materials"
    :pagination="materialPagination"
    :loading="materialLoading"
    @submit="refresh"
  />
  <div
    v-if="materialTotal > materialPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="materialLoading"
      v-model="materialPagination.page"
      input-class="text-bold text-black"
      :max="materialPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getMaterials({ page: materialPagination.page })"
    />
  </div>
</template>
