<script setup>
import { useRefreshToken } from 'src/stores/user/refreshToken.js'
import { useAbout } from "stores/user/about.js";
import { onMounted, ref } from "vue";

const accessToken = ref(localStorage.getItem('accessToken'));

if (accessToken.value) {
  let timestamp = JSON.parse(atob(accessToken.value.split('.')[1])).exp * 1000 - 3600000

  if (timestamp < new Date().getTime()) {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    useRefreshToken().refreshToken({refreshToken: storedRefreshToken || accessToken.value})
  }
}

onMounted(() => {
  if (accessToken.value) {
    useAbout().fetchAbout();
  }
})
</script>
<template>
  <div id="q-app">
    <div class="container">
      <h1> The project is under review </h1>
      <q-linear-progress dark stripe rounded size="20px" :value="100" color="red" class="q-mt-sm" />
    </div>
    <!--    <router-view />-->
  </div>
</template>

