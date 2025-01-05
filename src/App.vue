<script setup>
import { useRefreshToken } from 'src/stores/user/refreshToken.js'
import { useAbout } from "stores/user/about.js";
import { onMounted } from "vue";

if (localStorage.getItem('accessToken')) {
  let timestamp = JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1])).exp * 1000 - 3600000

  if (timestamp < new Date().getTime()) {
    useRefreshToken().refreshToken({refreshToken: localStorage.getItem('refreshToken')})
  }
}

onMounted(() => useAbout().fetchAbout())
</script>
<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

