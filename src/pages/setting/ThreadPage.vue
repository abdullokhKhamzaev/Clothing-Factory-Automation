<script setup>
import { computed, onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import ThreadTable from "components/tables/ThreadTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const thread = useThread();
const threads = ref([]);
const threadTotal = ref(0);
const threadLoading = ref(false);
const threadPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const threadPagesNumber = computed(() => Math.ceil(threadTotal.value / threadPagination.value.rowsPerPage));
function getThreads (filterProps) {
  let props = filterProps || {};

  threadLoading.value = true;
  thread.fetchThreads(props || '')
    .then((res) => {
      threads.value = res.data['hydra:member'];
      threadTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}
 function refresh () {
   threadPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getThreads();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <thread-table
    :threads="threads"
    :pagination="threadPagination"
    :loading="threadLoading"
    @submit="refresh"
  />
  <div
    v-if="threadTotal > threadPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="threadLoading"
      v-model="threadPagination.page"
      input-class="text-bold text-black"
      :max="threadPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getThreads({ page: threadPagination.page })"
    />
  </div>
</template>
