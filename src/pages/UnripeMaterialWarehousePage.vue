<script setup>
import { onMounted, ref } from "vue";
import { useMaterial } from "stores/material.js";
import UnripeMaterialWarehouseTable from "components/tables/UnripeMaterialWarehouseTable.vue";

const material = useMaterial();
const materials = ref([]);
const total = ref(0);
const loading = ref(false);

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

onMounted(() => {
  getMaterials();
})
</script>

<template>
  <unripe-material-warehouse-table
    :materials="materials"
    :total="total"
    :loading="loading"
    @submit="getMaterials"
  />
</template>
