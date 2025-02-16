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
      label: t('orders'),
      value: router.resolve( { name: 'club.cutter.orders' } )
    },
    {
      label: t('completedOrders'),
      value: router.resolve( { name: 'club.cutter.completedOrders' } )
    },
    {
      label: t('materials'),
      value: router.resolve( { name: 'club.cutter.materials' } )
    },
    {
      label: t('warehouse'),
      value: router.resolve( { name: 'club.cutter.warehouse' } )
    },
    {
      label: t('defects'),
      value: router.resolve( { name: 'club.cutter.defects' } )
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
