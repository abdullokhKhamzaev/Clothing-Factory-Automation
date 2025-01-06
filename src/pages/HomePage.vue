<script setup>
import { isAdmin } from "src/router/routes.js";
import {onMounted, ref} from "vue";
// import { isWeaver } from "src/router/routes.js";
import { computed } from "vue";

const admin = ref('');
// const weaver = ref('');

onMounted(() => {
  admin.value = isAdmin()
  // weaver.value = isWeaver()
})

const route = computed(() => {
  return admin.value ? '/admin/users' : '/weaver'
})
</script>
<template>
  <div
    class="row justify-center items-center q-pa-md"
    style="background: linear-gradient(#119cf1, #5A4A9F); height: 100vh"
  >
    <div class="col-xs-12 col-sm-10 col-md-8 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="flex justify-center">
            <div class="text-h4 text-weight-bold text-primary">
              Welcome to Kids Club
              <div class="text-center q-py-md">
                <q-btn
                  no-caps
                  label="Home"
                  color="green"
                  size="md"
                  icon-right="mdi-link"
                  :to="route"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
