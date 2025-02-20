<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Oops. Nothing here...
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        label="Go Home"
        no-caps
        @click="redirectUserByRole"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { isAdmin, isCutter, isEmbroiderer, isPackager, isSewer, isWeaver } from "src/router/routes.js";

const router = useRouter();

function redirectUserByRole() {
  if (isAdmin()) {
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
  } else {
    router.push('/');
  }
}
</script>
