<script setup>
import { reactive, ref } from "vue";
import { useAuth } from "stores/user/authorization.js";
import { useRouter } from "vue-router";

const router = useRouter();
let isLoading = ref(false);
const authorization = reactive({
  phone: '',
  password: ''
})

function auth() {
  isLoading.value = true;
  useAuth().auth(authorization)
    .then((res) => {
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      router.push('/');
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
                Login Form
              </div>
            </div>
          </div>

          <q-form ref="form" class="q-gutter-md" @submit="auth">
            <q-input
              v-model="authorization.phone"
              label="Phone"
              name="First Name"
              mask="+############"
            />
            <q-input v-model="authorization.password" label="Password" name="password" type="password"/>

            <div>
              <q-btn class="full-width" color="primary" label="Login" type="submit" :loading="isLoading" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
