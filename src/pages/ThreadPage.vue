<script setup>
import { onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import ThreadWarehouseTable from "components/tables/ThreadWarehouseTable.vue";

const thread = useThread();
const threads = ref([]);
const total = ref(0);
const loading = ref(false);

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

onMounted(() => {
  getThreads();
})
</script>

<template>
  <thread-warehouse-table
    :threads="threads"
    :total="total"
    :loading="loading"
    @submit="getThreads"
  />
</template>
