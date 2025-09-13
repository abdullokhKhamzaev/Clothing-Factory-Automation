<script setup>
import { reactive, ref } from "vue";
import { useAuth } from "stores/user/authorization.js";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
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
const $q = useQuasar();

let isLoading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');
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
  errorMessage.value = ''; // Clear previous errors

  useAuth().auth(authorization)
    .then((res) => {
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      useAbout().fetchAbout();

      // Success notification
      $q.notify({
        type: 'positive',
        message: 'Tizimga muvaffaqiyatli kirdingiz!',
        position: 'top',
        timeout: 2000,
        actions: [
          { icon: 'close', color: 'white', handler: () => { /* ... */ } }
        ]
      });

      redirectUserByRole();
    })
    .catch((err) => {
      console.log('Login error:', err);

      let message = 'Tizimga kirishda xatolik yuz berdi';

      // Handle Symfony API errors
      if (err.response && err.response.data) {
        // Common Symfony error structures
        if (err.response.data.message) {
          message = err.response.data.message;
        } else if (err.response.data.error) {
          message = err.response.data.error;
        } else if (err.response.data.detail) {
          message = err.response.data.detail;
        } else if (err.response.status === 401) {
          message = 'Telefon raqami yoki parol noto\'g\'ri';
        } else if (err.response.status === 422) {
          message = 'Ma\'lumotlar noto\'g\'ri formatda';
        } else if (err.response.status === 429) {
          message = 'Juda ko\'p urinish. Iltimos keyinroq qayta urinib ko\'ring';
        } else if (err.response.status >= 500) {
          message = 'Server xatoligi. Iltimos keyinroq qayta urinib ko\'ring';
        }
      } else if (err.message) {
        message = err.message;
      }

      // Set error message for display
      errorMessage.value = message;

      // Show notification
      $q.notify({
        type: 'negative',
        message: message,
        position: 'top',
        timeout: 5000,
        actions: [
          { icon: 'close', color: 'white', handler: () => { /* ... */ } }
        ]
      });
    })
    .finally(() => {
      isLoading.value = false;
    })
}
</script>

<template>
  <div class="login-container">
    <!-- Background shapes -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="row justify-center items-center full-height q-pa-md">
      <div class="col-xs-12 col-sm-10 col-md-6 col-lg-5 col-xl-4">
        <q-card class="login-card overflow-hidden">
          <q-card-section class="q-pa-md q-pa-md-xl">
            <!-- Logo and title section -->
            <div class="login-header q-mb-md q-mb-md-xl">
              <div class="flex justify-center q-mb-sm q-mb-md-md">
                <div class="logo-container bg-primary text-white flex items-center justify-center rounded-borders shadow-4">
                  <q-icon name="factory" size="60px" color="white" />
                </div>
              </div>
              <div class="text-center">
                <div class="text-h4 q-my-none text-weight-bold login-title">
                  Tizimga kirish
                </div>
                <div class="text-subtitle2 text-grey-6 q-mt-sm">
                  Kiyim fabrikasi boshqaruv tizimi
                </div>
              </div>
            </div>

            <!-- Error message display -->
            <div v-if="errorMessage" class="bg-negative text-white rounded-borders q-pa-md q-mb-md flex items-center justify-between error-banner">
              <div class="flex items-center">
                <q-icon name="error" color="white" size="20px" class="q-mr-sm" />
                <span class="text-body2 text-weight-medium">{{ errorMessage }}</span>
              </div>
              <q-btn
                flat
                round
                color="white"
                icon="close"
                size="sm"
                @click="errorMessage = ''"
              />
            </div>

            <q-form ref="form" class="login-form" @submit="auth">
              <!-- Phone input -->
              <div class="input-group q-mb-md-lg">
                <q-input
                  v-model="authorization.phone"
                  label="Telefon raqami"
                  name="telephone"
                  mask="+#################"
                  outlined
                  class="modern-input"
                  :rules="[val => !!val || 'Telefon raqami kiritilishi shart']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Password input -->
              <div class="input-group q-mb-md-xl">
                <q-input
                  v-model="authorization.password"
                  label="Parol"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  outlined
                  class="modern-input"
                  :rules="[val => !!val || 'Parol kiritilishi shart']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      color="grey-6"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Login button -->
              <div class="q-mb-md">
                <q-btn
                  class="full-width login-btn rounded-borders shadow-4 text-weight-medium"
                  color="primary"
                  label="Kirish"
                  type="submit"
                  :loading="isLoading"
                  :disable="isLoading"
                  size="lg"
                  unelevated
                  no-caps
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Kuting...
                  </template>
                </q-btn>
              </div>

              <!-- Footer text -->
              <div class="text-center q-mt-lg">
                <div class="text-caption text-grey-6">
                  Tizimga kirish orqali siz
                  <span class="text-primary cursor-pointer">Foydalanish shartlari</span>
                  va <span class="text-primary cursor-pointer">Maxfiylik siyosati</span>
                  bilan rozilikning e'lon qilasiz
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  overflow: hidden;
}

.full-height {
  min-height: 100vh;
}

/* Animated background shapes */
.bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 10%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.3;
  }
}

/* Login card */
.login-card {
  position: relative;
  z-index: 2;
  border-radius: 24px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15) !important;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  z-index: 1;
}

/* Logo container custom styles */
.logo-container {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

/* Login header */
.login-header {
  text-align: center;
}

.login-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

/* Modern inputs - using Quasar classes + minimal custom */
.modern-input .q-field__control {
  border-radius: 12px !important;
}

.modern-input.q-field--focused .q-field__control:before,
.modern-input.q-field--focused .q-field__control:after {
  border-color: #667eea !important;
}

/* Login button custom styles */
.login-btn {
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  transition: all 0.3s ease !important;
}

.login-btn:hover {
  transform: translateY(-2px) !important;
}

.login-btn:active {
  transform: translateY(0px) !important;
}

/* Responsive adjustments for mobile */
@media (max-width: 600px) {
  .login-card {
    margin: 12px;
    border-radius: 16px !important;
  }

  .login-title {
    font-size: 1.8rem;
  }

  .shape {
    display: none;
  }
}

/* Focus and hover effects */
.q-field--outlined .q-field__control {
  transition: all 0.3s ease;
}

.q-field--outlined.q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Custom scrollbar for mobile */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.7);
}

/* Error banner animation */
.error-banner {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Input validation styles */
.modern-input.q-field--error .q-field__control:before,
.modern-input.q-field--error .q-field__control:after {
  border-color: #f44336 !important;
}

.modern-input.q-field--error .q-field__control {
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
}
</style>
