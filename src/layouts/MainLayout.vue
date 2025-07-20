<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :icon="leftDrawerOpen ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-space />
        <q-btn
          flat
          dense
          size="lg"
          color="white"
          icon="mdi-logout"
          @click="logout"
          class="q-mr-md"
        >
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            :offset="[5, 5]"
          >
            {{ $t('logout') }}
          </q-tooltip>
        </q-btn>
        <q-btn-dropdown
          color="white"
          icon="language"
          flat
          dense
          size="md"
        >
          <q-list>
            <q-item
              v-for="(language, index) in LANGUAGES"
              :key="index"
              clickable
              v-close-popup
              @click="changeLang(language.value)"
              :class="locale === language.value ? 'bg-primary text-white' : ''"
            >
              <q-item-section>
                <q-item-label>{{ language.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
<!--        <q-toggle v-model="isDark" label="Dark Mode" />-->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-primary text-white"
    >
      <q-list>
        <q-item-label
          class="text-white text-h5 text-weight-medium"
          header
        >
          Kids Club
        </q-item-label>

        <q-separator />

        <q-item-label
          class="bg-white text-h5 text-weight-medium"
          header
        >
          <q-item
            class="flex q-pa-none q-ma-none"
          >
            <q-item-section
              style="max-width: 40px"
              avatar
            >
              <q-img src="favicon.png" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1 text-blue-grey-10">
                {{ user.about.fullName }}
              </q-item-label>
              <q-item-label caption>
                {{ user.about.phone }}
              </q-item-label>
              <q-item-label v-if="user?.about?.roles?.length">
                <q-badge align="top">{{ $t('roles.' + user.about.roles[0]) }}</q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-item-label>

        <q-separator />

        <side-bar-link
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page class="bg-white q-py-lg q-px-md">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from "vue-router";
import SideBarLink from 'components/SideBarLink.vue'
import { useAbout } from 'stores/user/about.js';
import { LANGUAGES } from 'src/libraries/constants/defaults.js';
// import {useQuasar} from "quasar";

const { locale } = useI18n();
const user = useAbout();
const router = useRouter();
const leftDrawerOpen = ref(false)

// const $q = useQuasar();
// const isDark = ref($q.dark.isActive)

// Watch toggle and apply dark mode
// watch(isDark, (val) => {
//   $q.dark.set(val)
// })
const linksList = [
  {
    title: 'users',
    icon: 'mdi-account-multiple',
    to: { name: 'club.users.employees' }
  },
  {
    title: 'weaving',
    icon: 'mdi-store-cog',
    to: { name: 'club.weave.orders' }
  },
  {
    title: 'paint',
    icon: 'mdi-palette-outline',
    to: { name: 'club.paint.orders' }
  },
  {
    title: 'cutting',
    icon: 'mdi-scissors-cutting',
    to: { name: 'club.cut.orders' }
  },
  {
    title: 'embroidery',
    icon: 'mdi-draw',
    to: { name: 'club.embroidery.warehouse' }
  },
  {
    title: 'sewing',
    icon: 'mdi-nail',
    to: { name: 'club.sew.warehouse' }
  },
  {
    title: 'package',
    icon: 'mdi-package-down',
    to: { name: 'club.package.warehouse' }
  },
  {
    title: 'productWarehouse',
    icon: 'mdi-warehouse',
    to: { name: 'club.productWarehouse' }
  },
  {
    title: 'customers',
    icon: 'mdi-account-group',
    to: { name: 'club.customers' }
  },
  // {
  //   title: 'orders',
  //   icon: 'mdi-store-alert-outline',
  //   to: { name: 'club.orders' }
  // },
  {
    title: 'sales',
    icon: 'mdi-cart-percent',
    to: { name: 'club.sales' }
  },
  {
    title: 'warehouse',
    icon: 'mdi-warehouse',
    to: { name: 'club.warehouse.accessory' }
  },
  {
    title: 'statistics',
    icon: 'mdi-chart-bar-stacked',
    to: { name: 'club.statistic' }
  },
  {
    title: 'budget',
    icon: 'mdi-bank-circle-outline',
    to: { name: 'club.budget.transactions' }
  },
  {
    title: 'settings',
    icon: 'mdi-cog',
    to: { name: 'club.setting.thread' }
  },
]

function logout() {
  localStorage.removeItem('accessToken')
  router.push('/login')
}

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function changeLang (lang) {
  locale.value = lang;
  localStorage.setItem('lang', lang)
}
</script>
