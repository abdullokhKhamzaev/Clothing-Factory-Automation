<script setup>
import { onMounted, ref } from "vue";
import { useUser } from "stores/user/user.js";
import UsersTable from "components/tables/UsersTable.vue";

const user = useUser();
const users = ref([]);
const total = ref(0);
const loading = ref(false);

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

onMounted(() => {
  getUsers();
})
</script>

<template>
  <UsersTable
    :users="users"
    :total="total"
    :loading="loading"
    @submit="getUsers"
  />
</template>

