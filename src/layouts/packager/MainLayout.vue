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
            <q-item-section
              style="max-width: 40px"
              avatar
            >
              <q-img src="favicon.png" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1">
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
    title: 'orders',
    icon: 'mdi-bell-alert-outline',
    to: { name: 'club.packager.warehouse' }
  },
  {
    title: 'salary',
    icon: 'mdi-cash',
    to: { name: 'club.packager.salary' }
  }
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
