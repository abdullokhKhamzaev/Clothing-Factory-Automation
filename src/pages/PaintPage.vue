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
      value: router.resolve( { name: 'club.paint.orders' } )
    },
    {
      label: t('repaintOrders'),
      value: router.resolve( { name: 'club.paint.repaintOrders' } )
    },
    {
      label: t('completedOrders'),
      value: router.resolve( { name: 'club.paint.completedOrders' } )
    },
    {
      label: t('completedRepaintOrders'),
      value: router.resolve( { name: 'club.paint.completedRepaintOrders' } )
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
