<script setup>
import {computed, onMounted, ref} from "vue";
import { useMaterial } from "stores/material.js";
import UnripeMaterialWarehouseTable from "components/tables/UnripeMaterialWarehouseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const material = useMaterial();
const materials = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
})
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage))

function getMaterials (filterProps) {
  loading.value = true;

  material.fetchMaterials(filterProps || '')
    .then((res) => {
      materials.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

function refresh () {
  pagination.value = {
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
  <div class="q-ma-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <unripe-material-warehouse-table
    :materials="materials"
    :pagination="pagination"
    :loading="loading"
  />
  <div
    v-if="total > pagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="loading"
      v-model="pagination.page"
      input-class="text-bold text-black"
      :max="pagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getMaterials({ page: pagination.page })"
    />
  </div>
</template>
