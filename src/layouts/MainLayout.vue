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
        <q-select
          v-model="locale"
          :options="LANGUAGES"
          :label="$t('language')"
          color="black"
          options-dense
          emit-value
          map-options
          style="min-width: 150px"
          outlined
          dense
          filled
          bg-color="white"
          @update:model-value="changeLang"
        >
          <template v-slot:append>
            <q-avatar>
              <q-icon name="mdi-translate-variant" size="sm" color="primary" />
            </q-avatar>
          </template>
        </q-select>
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
              <q-item-label>
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

const { locale } = useI18n();
const user = useAbout();
const router = useRouter();
const leftDrawerOpen = ref(false)
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
