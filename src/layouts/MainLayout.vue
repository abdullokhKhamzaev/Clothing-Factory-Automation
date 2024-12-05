<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :icon="leftDrawerOpen ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
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
                Abdulloh
              </q-item-label>
              <q-item-label caption>
                abdulloh@gmail.com
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import SideBarLink from 'components/SideBarLink.vue'

const linksList = [
  {
    title: 'Foydalanuvchilar',
    icon: 'person',
    to: { name: 'club.users' }
  },
  {
    title: 'To’quv',
    icon: 'precision_manufacturing',
    to: { name: 'club.weave' }
  },
  {
    title: 'Hom Material Sklad',
    icon: 'warehouse',
    to: { name: 'club.unripeMaterialWarehouse' }
  },
  {
    title: 'Bo’yoq',
    icon: 'palette',
    to: { name: 'club.paint' }
  },
  {
    title: 'Tayyor Material Sklad',
    icon: 'warehouse',
    to: { name: 'club.material-warehouse' }
  },
  {
    title: 'Bichuv',
    icon: 'content_cut',
    to: { name: 'club.cut' }
  },
  {
    title: 'Vishevka',
    icon: 'grain',
    to: { name: 'club.embroidery' }
  },
  {
    title: 'Tikuv',
    icon: 'grain',
    to: { name: 'club.sew' }
  },
  {
    title: 'Upakovka',
    icon: 'grain',
    to: { name: 'club.packing' }
  },
  {
    title: 'Product Sklad',
    icon: 'grain',
    to: { name: 'club.productWarehouse' }
  },
  {
    title: 'Mijozlar',
    icon: 'group',
    to: { name: 'club.clients' }
  },
  {
    title: 'Statistika',
    icon: 'insert_chart',
    to: { name: 'club.statistic' }
  },
  {
    title: 'Budget',
    icon: 'assured_workload',
    to: { name: 'club.budget' }
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
