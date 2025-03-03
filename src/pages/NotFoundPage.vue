<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Упс. Хэчнарса топилмади...
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        label="Бош Сахифага Ýтиш"
        no-caps
        @click="redirectUserByRole"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from "vue";
import {
  isAdmin,
  isCutter,
  isEmbroiderer,
  isMaster,
  isPackager,
  isSewer,
  isSuperAdmin,
  isWeaver
} from "src/router/routes.js";

const router = useRouter();

function redirectUserByRole() {
  if (isAdmin() || isSuperAdmin()) {
    router.push({name: 'club.users.employees'});
  } else if (isWeaver()) {
    router.push({name: 'club.weaver.orders'});
  } else if (isCutter()) {
    router.push({name: 'club.cutter.orders'});
  } else if (isEmbroiderer()) {
    router.push({name: 'club.embroiderer.warehouse'});
  } else if (isSewer()) {
    router.push({name: 'club.sewer.warehouse'});
  } else if (isPackager()) {
    router.push({name: 'club.packager.warehouse'});
  } else if(isMaster()) {
    router.push({name: 'club.master'});
  } else {
    router.push('/login');
  }
}

onMounted(() => redirectUserByRole());
</script>
