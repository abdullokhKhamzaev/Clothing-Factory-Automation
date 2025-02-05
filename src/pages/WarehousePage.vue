<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RouteTabs from "components/RouteTabs.vue";

const { t } = useI18n();
const router = useRouter();

const routes = computed(() => {
  return [
    {
      label: t('accessory'),
      value: router.resolve( { name: 'club.warehouse.accessory' } )
    },
    {
      label: t('thread'),
      value: router.resolve( { name: 'club.warehouse.thread' } )
    },
    {
      label: t('unripeMaterial'),
      value: router.resolve( { name: 'club.warehouse.unripeMaterial' } )
    },
    {
      label: t('ripeMaterial'),
      value: router.resolve( { name: 'club.warehouse.ripeMaterial' } )
    }
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
