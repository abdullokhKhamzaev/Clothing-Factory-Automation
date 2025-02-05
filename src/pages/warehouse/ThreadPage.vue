<script setup>
import {computed, onMounted, ref} from "vue";
import { useThread } from "stores/thread.js";
import ThreadWarehouseTable from "components/tables/ThreadWarehouseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const thread = useThread();
const threads = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
})
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage))

function getThreads (filterProps) {
  loading.value = true;

  thread.fetchThreads(filterProps || '')
    .then((res) => {
      threads.value = res.data['hydra:member'];
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
  getThreads();
}

onMounted(() => {
  getThreads();
})
</script>

<template>
  <div class="q-ma-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <thread-warehouse-table
    :threads="threads"
    :pagination="pagination"
    :loading="loading"
    @submit="refresh"
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
      @update:model-value="getThreads({ page: pagination.page })"
    />
  </div>
</template>
