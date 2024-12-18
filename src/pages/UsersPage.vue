<script setup>
import {onMounted, ref} from 'vue'
import { useFetchUsers } from "stores/user/getUsers.js";
import UsersTable from "components/UsersTable.vue";
const storeUser = useFetchUsers();
const loading = ref(false);

function queryUsers () {
  loading.value = true;
  storeUser.usersGet('?page=1');
  loading.value = false;
}
onMounted(() => {
  queryUsers();
})

function handleAction() {
  queryUsers();
}
</script>

<template>
  <div class="q-pa-md">
    <UsersTable
      :users="storeUser.state.users"
      @submit="handleAction"
    />
  </div>
</template>

