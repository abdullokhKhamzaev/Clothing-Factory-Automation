<script setup>
import { onMounted, ref } from "vue";
import { useUser } from "stores/user/user.js";
import UsersTable from "components/tables/UsersTable.vue";

const user = useUser();
const users = ref([]);
const loading = ref(false);

function getUsers () {
  loading.value = true;
  user.fetchUsers('?page=1')
    .then((res) => {
      users.value = res.data['hydra:member'];
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
  <div class="q-pa-md">
    <UsersTable
      :users="users"
      :loading="loading"
      @submit="getUsers"
    />
  </div>
</template>

