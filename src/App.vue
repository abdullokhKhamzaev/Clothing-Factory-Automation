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
<!--  <div id="q-app" class="flex full-height justify-center items-center" style="min-height: 100vh">-->
<!--      <div>-->
<!--        <h1 class="text-h5 text-primary"> Revizya jarayonida: </h1>-->
<!--        <q-linear-progress dark stripe rounded size="20px" :value="0.8" color="orange" />-->
<!--      </div>-->
<!--  </div>-->
  <div id="q-app">
    <router-view />
  </div>
</template>

