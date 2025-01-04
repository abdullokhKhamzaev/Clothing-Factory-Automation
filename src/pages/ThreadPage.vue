<script setup>
import { onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import ThreadWarehouseTable from "components/tables/ThreadWarehouseTable.vue";

const thread = useThread();
const threads = ref([]);
const loading = ref(false);

function getThreads () {
  loading.value = true;
  thread.fetchThreads('')
    .then((res) => {
      threads.value = res.data['hydra:member'];
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
    :loading="loading"
    @submit="getThreads"
  />
</template>
