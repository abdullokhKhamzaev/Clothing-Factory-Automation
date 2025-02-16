<script setup>
import { computed } from "vue";
import RouteTabs from "components/RouteTabs.vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const routes = computed(() => {
  return [
    {
      label: t('orders'),
      value: router.resolve( { name: 'club.weaver.orders' } )
    },
    {
      label: t('completedOrders'),
      value: router.resolve( { name: 'club.weaver.completed' } )
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
