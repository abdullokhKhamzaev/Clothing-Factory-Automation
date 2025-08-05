<script setup>
import { reactive, ref } from "vue";
import { useAuth } from "stores/user/authorization.js";
import { useRouter } from "vue-router";
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
import {useAbout} from "stores/user/about.js";

const router = useRouter();

let isLoading = ref(false);
const authorization = reactive({
  phone: '',
  password: ''
})

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
    router.push({name: 'club.master.embroidery.ready'});
  } else {
    router.push('/login');
  }
}

function auth() {
  isLoading.value = true;
  useAuth().auth(authorization)
    .then((res) => {
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      useAbout().fetchAbout();
      redirectUserByRole();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      isLoading.value = false;
    })
}
</script>

<template>
  <div
    class="row justify-center items-center q-pa-md"
    style="background: linear-gradient(#119cf1, #5A4A9F); height: 100vh"
  >
    <div class="col-xs-12 col-sm-10 col-md-8 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="q-mb-xl">
            <div class="flex justify-center">
              <div class="text-h4 q-my-none text-weight-bold text-primary">
                Tizimga kirish
              </div>
            </div>
          </div>

          <q-form ref="form" class="q-gutter-md" @submit="auth">
            <q-input
              v-model="authorization.phone"
              label="Telefon"
              name="telephone"
              mask="+#################"
            />
            <q-input v-model="authorization.password" label="Parol" name="password" type="password"/>

            <div>
              <q-btn class="full-width" color="primary" label="Kirish" type="submit" :loading="isLoading" :disable="isLoading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
