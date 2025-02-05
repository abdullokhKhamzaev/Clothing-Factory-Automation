<script setup>
import { computed, onMounted, ref } from "vue";
import { usePaintFabric } from "stores/paintFabric.js";
import FabricTable from "components/tables/FabricTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const fabric = usePaintFabric();
const fabrics = ref([]);
const fabricTotal = ref(0);
const fabricLoading = ref(false);
const fabricPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const fabricPagesNumber = computed(() => Math.ceil(fabricTotal.value / fabricPagination.value.rowsPerPage));
function getFabrics (filterProps) {
  let props = filterProps || {};
  fabricLoading.value = true;
  fabric.fetchFabrics(props || '')
    .then((res) => {
      fabrics.value = res.data['hydra:member'];
      fabricTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      fabricLoading.value = false;
    });
}

 function refresh () {
   fabricPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getFabrics();
 }

onMounted(() => {
  refresh();
})

</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <fabric-table
    :fabrics="fabrics"
    :pagination="fabricPagination"
    :loading="fabricLoading"
    @submit="refresh"
  />
  <div
    v-if="fabricTotal > fabricPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="fabricLoading"
      v-model="fabricPagination.page"
      input-class="text-bold text-black"
      :max="fabricPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getFabrics({ page: fabricPagination.page })"
    />
  </div>
</template>
