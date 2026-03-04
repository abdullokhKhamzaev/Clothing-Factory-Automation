<script setup>
import { useRefreshToken } from 'src/stores/user/refreshToken.js'
import { useAbout } from "stores/user/about.js";
import { onMounted, ref } from "vue";

const accessToken = ref(localStorage.getItem('accessToken'));

if (accessToken.value) {
  let timestamp = JSON.parse(atob(accessToken.value.split('.')[1])).exp * 1000 - 3600000

  if (timestamp < new Date().getTime()) {
    useRefreshToken().refreshToken({refreshToken: accessToken.value})
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
    <router-view />
  </div>
</template>

