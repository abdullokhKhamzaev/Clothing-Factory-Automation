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
    >
      <q-list>
        <q-item-label
          class="text-h5 text-primary text-weight-medium"
          header
        >
          Kids Club Inc
        </q-item-label>

        <q-separator />

        <q-item-label
          class="text-h5 text-primary text-weight-medium"
          header
        >
          <q-item
            class="flex q-pa-none q-ma-none"
          >
            <q-item-section
              style="max-width: 40px"
              avatar
            >
              <q-img src="favicon.ico" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1 text-blue-grey-10">
                {{ user.about.fullName }}
              </q-item-label>
              <q-item-label caption>
                {{ user.about.phone }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-item-label>

        <q-separator />

        <side-bar-link
          v-for="link in linksList"
          menu-route="weaver"
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
    title: 'orders',
    icon: 'mdi-bell-alert-outline',
    to: { name: 'club.sewer.warehouse' }
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
