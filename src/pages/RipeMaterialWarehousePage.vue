<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import RipeMaterialWarehouseTable from "components/tables/RipeMaterialWarehouseTable.vue";
//
const ripeMaterial = useRipeMaterial();
const ripeMaterials = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
})
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage))

function getRipeMaterials (filterProps) {
  loading.value = true;

  ripeMaterial.fetchRipeMaterials(filterProps || '')
    .then((res) => {
      ripeMaterials.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  getRipeMaterials();
})
</script>

<template>
  <ripe-material-warehouse-table
    :materials="ripeMaterials"
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
      @update:model-value="getRipeMaterials({ page: pagination.page })"
    />
  </div>
</template>
