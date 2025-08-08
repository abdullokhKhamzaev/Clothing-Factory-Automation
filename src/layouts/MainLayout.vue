<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar :class="isDark ? 'bg-dark text-white' : 'bg-white text-dark'">
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
        <q-icon
          size="md"
          name="mdi-theme-light-dark"
          class="q-mr-md"
          @click="toggleTheme"
        />
        <q-btn-dropdown
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
            >
              <q-item-section>
                <q-item-label>{{ language.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          class="text-h5 text-weight-medium"
          header
        >
          Kids Club
        </q-item-label>

        <q-separator />

        <q-item-label
          class="text-h5 text-weight-medium"
          header
        >
          <q-item
            class="flex q-pa-none q-ma-none"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">
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
      <q-page class="q-py-lg q-px-md">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {ref} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from "vue-router";
import SideBarLink from 'components/SideBarLink.vue'
import { useAbout } from 'stores/user/about.js';
import { useTheme } from 'src/composables/useTheme.js';
import { LANGUAGES } from 'src/libraries/constants/defaults.js';

const { locale } = useI18n();
const user = useAbout();
const router = useRouter();
const leftDrawerOpen = ref(false)

// Theme management with localStorage persistence
const { isDark, toggleTheme } = useTheme()
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
