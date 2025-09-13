<template>
  <div class="not-found-container">
    <!-- Background elements -->
    <div class="bg-elements">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <div class="fullscreen flex flex-center text-center q-pa-md q-pa-lg-md">
      <div class="not-found-content">
        <!-- 404 Animation -->
        <div class="error-number q-mb-md q-mb-lg-md">
          <div class="number-container">
            <span class="error-digit">4</span>
            <div class="zero-container">
              <q-icon name="search_off" class="zero-icon" />
            </div>
            <span class="error-digit">4</span>
          </div>
        </div>

        <!-- Error message -->
        <div class="error-message q-mb-lg q-mb-xl-md">
          <h2 class="text-h3 text-weight-bold q-mb-md error-title">
            Ups! Hechnima topilmadi
          </h2>
          <p class="text-subtitle1 error-subtitle">
            Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-center q-gutter-md row">
          <q-btn
            class="home-btn rounded-borders text-weight-bold shadow-4"
            color="white"
            text-color="primary"
            size="xl"
            unelevated
            no-caps
            style="min-width: 200px; padding: 12px 24px;"
            @click="redirectUserByRole"
          >
            <q-icon name="home" class="q-mr-sm" size="18px" />
            Bosh sahifaga qaytish
          </q-btn>
          <q-btn
            class="logout-btn rounded-borders text-weight-bold shadow-4"
            color="red-6"
            size="xl"
            unelevated
            no-caps
            style="min-width: 180px; padding: 12px 24px;"
            @click="logout"
          >
            <q-icon name="logout" class="q-mr-sm" size="18px" />
            Tizimdan chiqish
          </q-btn>
        </div>

        <!-- Additional info -->
        <div class="additional-info q-mt-lg q-mt-xl-md text-center">
          <div class="text-body2 additional-text">
            Agar muammo davom etsa,<br>
            <span class="cursor-pointer text-weight-medium text-white rounded-borders q-pa-xs admin-link-hover" @click="callAdmin">
              <q-icon name="phone" size="16px" class="q-mr-xs" />
              administrator bilan bog'laning
            </span>
          </div>
        </div>
      </div>
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
    router.push({name: 'club.master.embroidery.ready'});
  } else {
    router.push('/login');
  }
}

function logout() {
  localStorage.removeItem('accessToken')
  router.push('/login')
}

function callAdmin() {
  // Open phone dialer with admin number
  window.open('tel:+998970003525', '_self');
}

onMounted(() => redirectUserByRole());
</script>

<style scoped>
/* Container and background */
.not-found-container {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  overflow: hidden;
}

/* Floating background shapes */
.bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 150px;
  height: 150px;
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 100px;
  height: 100px;
  top: 70%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 80px;
  height: 80px;
  top: 30%;
  right: 30%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.3;
  }
}

/* Content container */
.not-found-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  color: white;
}

/* 404 Number styling */
.error-number {
  margin-bottom: 2rem;
}

.number-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.error-digit {
  font-size: 8rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: bounce 2s ease-in-out infinite;
}

.error-digit:first-child {
  animation-delay: 0.2s;
}

.error-digit:last-child {
  animation-delay: 0.4s;
}

.zero-container {
  width: 120px;
  height: 120px;
  border: 6px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: pulse 2s ease-in-out infinite;
}

.zero-icon {
  font-size: 3rem;
  color: white;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
}

/* Error message styling */
.error-title {
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.error-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.2rem;
  line-height: 1.6;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  font-weight: 400;
}

/* Button custom styles - enhanced for better appearance */
.home-btn,
.logout-btn {
  font-size: 16px !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
  min-height: 54px;
}

.home-btn {
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25) !important;
}

.logout-btn {
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.25) !important;
}

.home-btn:hover,
.logout-btn:hover {
  transform: translateY(-2px);
}

.home-btn:hover {
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.35) !important;
}

.logout-btn:hover {
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.35) !important;
}

/* Additional info */
.additional-info {
  color: rgba(255, 255, 255, 0.9);
}

.additional-text {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Admin link hover - minimal custom CSS */
.admin-link-hover {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.admin-link-hover:hover {
  transform: scale(1.05);
  text-decoration-color: #fff;
  background: rgba(255, 255, 255, 0.2) !important;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.admin-link-hover:hover .q-icon {
  transform: rotate(5deg);
}

/* Responsive design */
@media (max-width: 768px) {
  .error-digit {
    font-size: 4rem;
  }
  
  .zero-container {
    width: 70px;
    height: 70px;
    border-width: 4px;
  }
  
  .zero-icon {
    font-size: 2rem;
  }
  
  .floating-shape {
    display: none;
  }
  
  /* Mobile button styles */
  .home-btn,
  .logout-btn {
    width: 100%;
    max-width: 280px;
    margin: 8px 0;
  }
  
  /* Stack buttons vertically on mobile */
  .row {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .error-digit {
    font-size: 3rem;
  }
  
  .zero-container {
    width: 50px;
    height: 50px;
    border-width: 3px;
  }
  
  .zero-icon {
    font-size: 1.3rem;
  }
  
  .home-btn,
  .logout-btn {
    max-width: 260px;
    font-size: 14px !important;
  }
}
</style>
