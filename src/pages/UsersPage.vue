<script setup>
import { useQuasar } from 'quasar'
import {onMounted, reactive, ref} from 'vue'
import { useFetchUsers } from "stores/user/getUsers.js";
import { useUser } from "stores/user/createUser.js";
import UsersTable from "components/UsersTable.vue";
const storeUser = useFetchUsers();
const loading = ref(false);
const isPwd = ref(false);
const createUserDialog = ref(false);

const $q = useQuasar();

const user = reactive({
  name: null,
  surName: null,
  phone: null,
  password: null,
  salary: null,
  salaryCurrency: null
});
function clear() {
  user.name = null;
  user.surName = null;
  user.phone = null;
  user.password = null;
  user.salary = null;
  user.salaryCurrency = null;
}
function queryUsers () {
  loading.value = true;
  storeUser.usersGet('?page=1');
  loading.value = false;
}
function createUser() {
  loading.value = true

  useUser().userCreate(user)
    .finally(() => {
      loading.value = false;
      createUserDialog.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: "Yangi foydalanuvchi qo'shildi"
      })
      clear();
      queryUsers();
    })
}
onMounted(() => {
  queryUsers();
})

function handleAction() {
  queryUsers();
}
</script>

<template>
  <div class="q-pa-md">
    <div class="flex q-mb-md">
      <q-btn
        color="primary"
        label="Foydalanuvchi qo'shish"
        no-caps
        icon-right="add"
        @click="createUserDialog = true"
      />
    </div>

    <UsersTable
      :users="storeUser.state.users"
      @submit="handleAction"
    />

    <!-- Dialogs -->
    <q-dialog v-model="createUserDialog">
      <q-card style="width: 900px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Foydalanuvchi qo'shish</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form
            @submit="createUser"
            @reset="clear"
            class="q-gutter-md"
          >
            <q-input
              filled
              v-model="user.name"
              label="Ism *"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Iltimos ismni kiriting']"
            />
            <q-input
              filled
              v-model="user.surName"
              label="Familya *"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Iltimos familyani kiriting']"
            />
            <q-input
              filled
              v-model="user.phone"
              label="Telefon *"
              name="First Name"
              mask="+############"
              :rules="[ val => val && val.length > 0 || 'Iltimos telefon raqamni kiriting']"
            />

            <q-input
              :type="isPwd ? 'password' : 'text'"
              filled
              v-model="user.password"
              label="Parol *"
              :rules="[ val => val && val.length > 0 || 'Iltimos parolni kiriting']"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <q-select
              filled
              v-model="user.salaryCurrency"
              :options="[
                '/api/currencies/1'
              ]"
              label="Valyuta"
            />

            <q-input
              filled
              type="number"
              v-model="user.salary"
              label="Oylik *"
              :rules="[ val => val && val.length > 0 || 'Iltimos oylikni kiriting']"
            />

            <div>
              <q-btn label="Qo'shish" type="submit" color="primary"/>
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

