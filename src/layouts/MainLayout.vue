<template>
  <q-layout view="lHh Lpr lFf" class="modern-layout">
    <q-header class="modern-header">
      <q-toolbar class="modern-toolbar q-px-lg">
        <q-btn
          flat
          dense
          round
          :icon="leftDrawerOpen ? 'keyboard_double_arrow_left' : 'menu'"
          :class="isDark ? 'text-grey-3' : 'text-grey-8'"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="modern-title">
          <div class="text-weight-medium">
            Kids Club
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- Header actions -->
        <div class="row q-gutter-sm items-center">
          <q-btn
            flat
            dense
            round
            :icon="isDark ? 'light_mode' : 'dark_mode'"
            :class="isDark ? 'text-orange-4' : 'text-orange-8'"
            @click="toggleTheme"
          >
            <q-tooltip class="bg-grey-8">
              {{ isDark ? 'Light Mode' : 'Dark Mode' }}
            </q-tooltip>
          </q-btn>

          <q-btn-dropdown
            icon="language"
            flat
            dense
            round
            :class="isDark ? 'text-grey-3' : 'text-grey-8'"
          >
            <q-list class="q-pa-sm">
              <q-item
                v-for="(language, index) in LANGUAGES"
                :key="index"
                clickable
                v-close-popup
                @click="changeLang(language.value)"
                class="rounded-borders q-mb-xs"
              >
                <q-item-section>
                  <q-item-label>{{ language.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            flat
            dense
            round
            icon="logout"
            class="text-red-7"
            @click="logout"
          >
            <q-tooltip class="bg-grey-8">
              {{ $t('logout') }}
            </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="280"
      class="modern-drawer"
      :class="isDark ? 'bg-dark' : 'bg-grey-1'"
    >
      <div class="column full-height">
        <!-- User Profile Section -->
        <div class="user-profile-section q-pa-lg q-ma-md rounded-borders text-center">
          <q-avatar size="60px" class="user-avatar q-mb-md">
            <q-icon name="person" size="32px" color="white" />
          </q-avatar>
          <div :class="isDark ? 'text-h6 text-weight-medium text-grey-3' : 'text-h6 text-weight-medium text-grey-8'">
            {{ user.about.fullName }}
          </div>
          <div :class="isDark ? 'text-caption text-grey-5 q-mb-sm' : 'text-caption text-grey-6 q-mb-sm'">
            {{ user.about.phone }}
          </div>
          <q-badge
            v-if="user?.about?.roles?.length"
            color="primary"
            rounded
            class="text-caption"
          >
            {{ $t('roles.' + user.about.roles[0]) }}
          </q-badge>
        </div>

        <q-separator class="q-mx-md" />

        <!-- Navigation Links -->
        <div class="col">
          <side-bar-link
            v-for="link in linksList"
            :key="link.title"
            v-bind="link"
            class="q-mb-xs"
          />
        </div>
      </div>
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
    icon: 'group',
    to: { name: 'club.users.employees' },
    routePrefix: '/admin/users'
  },
  {
    title: 'weaving',
    icon: 'texture',
    to: { name: 'club.weave.orders' },
    routePrefix: '/admin/weave'
  },
  {
    title: 'paint',
    icon: 'palette',
    to: { name: 'club.paint.orders' },
    routePrefix: '/admin/paint'
  },
  {
    title: 'cutting',
    icon: 'content_cut',
    to: { name: 'club.cut.orders' },
    routePrefix: '/admin/cut'
  },
  {
    title: 'embroidery',
    icon: 'brush',
    to: { name: 'club.embroidery.warehouse' },
    routePrefix: '/admin/embroidery'
  },
  {
    title: 'sewing',
    icon: 'precision_manufacturing',
    to: { name: 'club.sew.warehouse' },
    routePrefix: '/admin/sew'
  },
  {
    title: 'package',
    icon: 'inventory_2',
    to: { name: 'club.package.warehouse' },
    routePrefix: '/admin/packing'
  },
  {
    title: 'productWarehouse',
    icon: 'warehouse',
    to: { name: 'club.productWarehouse' },
    routePrefix: '/admin/product-warehouse'
  },
  {
    title: 'customers',
    icon: 'people',
    to: { name: 'club.customers' },
    routePrefix: '/admin/customers'
  },
  {
    title: 'sales',
    icon: 'shopping_cart',
    to: { name: 'club.sales' },
    routePrefix: '/admin/sales'
  },
  {
    title: 'warehouse',
    icon: 'storage',
    to: { name: 'club.warehouse.accessory' },
    routePrefix: '/admin/warehouse'
  },
  {
    title: 'statistics',
    icon: 'analytics',
    to: { name: 'club.statistic' },
    routePrefix: '/admin/statistic'
  },
  {
    title: 'budget',
    icon: 'account_balance',
    to: { name: 'club.budget.transactions' },
    routePrefix: '/admin/budget'
  },
  {
    title: 'settings',
    icon: 'settings',
    to: { name: 'club.setting.thread' },
    routePrefix: '/admin/setting'
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

