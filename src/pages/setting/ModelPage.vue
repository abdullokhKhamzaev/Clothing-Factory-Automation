<script setup>
import { computed, onMounted, ref } from "vue";
import { useProductModels } from "stores/productModel.js";
import ModelTable from "components/tables/ModelTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const model = useProductModels();
const models = ref([]);
const modelTotal = ref(0);
const modelLoading = ref(false);
const modelPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const modelPagesNumber = computed(() => Math.ceil(modelTotal.value / modelPagination.value.rowsPerPage));
function getModels (filterProps) {
  let props = filterProps || {};
  modelLoading.value = true;
  model.fetchProductModels(props || '')
    .then((res) => {
      models.value = res.data['hydra:member'];
      modelTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      modelLoading.value = false;
    });
}
 function refresh () {
   modelPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getModels();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <model-table
    :models="models"
    :pagination="modelPagination"
    :loading="modelLoading"
    @submit="refresh"
  />
  <div
    v-if="modelTotal > modelPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="modelLoading"
      v-model="modelPagination.page"
      input-class="text-bold text-black"
      :max="modelPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getModels({ page: modelPagination.page })"
    />
  </div>
</template>
