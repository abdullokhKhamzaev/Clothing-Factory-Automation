<script setup>
import { computed, onMounted, ref } from "vue";
import { useEmbroidery } from "stores/embroidery.js";
import EmbroideryTable from "components/tables/EmbroideryTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const embroidery = useEmbroidery();
const embroideries = ref([]);
const embroideryTotal = ref(0);
const embroideryLoading = ref(false);
const embroideryPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const embroideryPagesNumber = computed(() => Math.ceil(embroideryTotal.value / embroideryPagination.value.rowsPerPage));
function getEmbroideries (filterProps) {
  let props = filterProps || {};
  embroideryLoading.value = true;
  embroidery.fetchEmbroideries(props || '')
    .then((res) => {
      embroideries.value = res.data['hydra:member'];
      embroideryTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      embroideryLoading.value = false;
    });
}

 function refresh () {
   embroideryPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getEmbroideries();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <embroidery-table
    :embroideries="embroideries"
    :pagination="embroideryPagination"
    :loading="embroideryLoading"
    @submit="refresh"
  />
  <div
    v-if="embroideryTotal > embroideryPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="embroideryLoading"
      v-model="embroideryPagination.page"
      input-class="text-bold text-black"
      :max="embroideryPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getEmbroideries({ page: embroideryPagination.page })"
    />
  </div>
</template>
