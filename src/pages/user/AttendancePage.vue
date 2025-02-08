<script setup>
import { computed, onMounted, ref } from "vue";
import { useUser } from "stores/user/user.js";
import RefreshButton from "components/RefreshButton.vue";
import AttendanceTable from "components/tables/AttendanceTable.vue";

const user = useUser();
const users = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage));
const fullName = ref('')

function getUsers (filterProps) {
  loading.value = true;

  user.fetchUsers(filterProps || '')
    .then((res) => {
      users.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

function refresh (fullName) {
  if (fullName) {
    fullName.value = fullName;
  }

  pagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getUsers(fullName);
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-mb-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <attendance-table
    :users="users"
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
      @update:model-value="getUsers({ fullName: fullName, page: pagination.page })"
    />
  </div>
</template>

