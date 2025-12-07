<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import RouteTabs from "components/RouteTabs.vue";

const { t } = useI18n();
const router = useRouter();
const routes = computed(() => {
  return [
    {
      label: t('menus.sideBar.embroidery'),
      value: router.resolve( { name: 'club.master.embroidery.ready' } )
    },
    {
      label: t('menus.sideBar.sewing'),
      value: router.resolve( { name: 'club.master.sewing.ready' } )
    },
    {
      label: t('menus.sideBar.package'),
      value: router.resolve( { name: 'club.master.packaging.ready' } )
    },
    {
      label: t('menus.sideBar.cutting'),
      value: router.resolve( { name: 'club.master.cutting' } )
    },
  ];
})
</script>

<template>
  <div>
    <route-tabs
      :routes="routes"
      class="q-mb-md"
    />
    <router-view />
  </div>
</template>
