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
                Registration Form
              </div>
            </div>
          </div>

          <q-form ref="form" class="q-gutter-md" @submit="submit">
            <q-input v-model="user.first_name" label="First Name" name="First Name"/>
            <q-input v-model="user.last_name" label="Last Name" name="Last Name"/>
            <q-input v-model="user.email" label="Email" name="Email"/>
            <q-input v-model="user.password" label="Password" name="password" type="password"/>

            <div>
              <q-btn class="full-width" color="primary" label="Register" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import {reactive} from "vue";

const user = reactive({
  last_name: null,
  first_name: null,
  email: null,
  password: null
})
const submit = () => {
  console.log('asa');
}
</script>
