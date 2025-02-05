<script setup>
import { computed, onMounted, ref } from "vue";
import { useColor } from "stores/color.js";
import FabricColorTable from "components/tables/FabricColorTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const color = useColor();
const colors = ref([]);
const colorTotal = ref(0);
const colorLoading = ref(false);
const colorPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const colorPagesNumber = computed(() => Math.ceil(colorTotal.value / colorPagination.value.rowsPerPage));
function getColors (filterProps) {
  let props = filterProps || {};
  colorLoading.value = true;
  color.fetchColors(props || '')
    .then((res) => {
      colors.value = res.data['hydra:member'];
      colorTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      colorLoading.value = false;
    });
}

 function refresh () {
   colorPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getColors();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <fabric-color-table
    :colors="colors"
    :pagination="colorPagination"
    :loading="colorLoading"
    @submit="refresh"
  />
  <div
    v-if="colorTotal > colorPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="colorLoading"
      v-model="colorPagination.page"
      input-class="text-bold text-black"
      :max="colorPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getColors({ page: colorPagination.page })"
    />
  </div>
</template>
