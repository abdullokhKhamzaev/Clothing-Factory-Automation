<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import RouteTabs from "components/RouteTabs.vue";

const { t } = useI18n();
const router = useRouter();
const routes = computed(() => {
  return [
    // {
    //   label: t('warehouses.embroideryWarehouse'),
    //   value: router.resolve( { name: 'club.master.embroidery.warehouse' } )
    // },
    {
      label: t('warehouses.embroideryReadyWarehouse'),
      value: router.resolve( { name: 'club.master.embroidery.ready' } )
    },
    {
      label: t('warehouses.sewerWarehouse'),
      value: router.resolve( { name: 'club.master.sewing.warehouse' } )
    },
    {
      label: t('warehouses.sewerReadyWarehouse'),
      value: router.resolve( { name: 'club.master.sewing.ready' } )
    },
    // {
    //   label: t('warehouses.packagerWarehouse'),
    //   value: router.resolve( { name: 'club.master.packaging.warehouse' } )
    // },
    {
      label: t('warehouses.packagerReadyWarehouse'),
      value: router.resolve( { name: 'club.master.packaging.ready' } )
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
