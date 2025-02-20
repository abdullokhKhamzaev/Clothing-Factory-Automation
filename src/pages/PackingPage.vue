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
      label: t('warehouse'),
      value: router.resolve( { name: 'club.package.warehouse' } )
    },
    {
      label: t('ready'),
      value: router.resolve( { name: 'club.package.ready' } )
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

