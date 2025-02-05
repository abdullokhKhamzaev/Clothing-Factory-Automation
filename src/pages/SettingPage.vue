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
      label: t('thread'),
      value: router.resolve( { name: 'club.setting.thread' } )
    },
    {
      label: t('unripeMaterial'),
      value: router.resolve( { name: 'club.setting.unripeMaterial' } )
    },
    {
      label: t('ripeMaterial'),
      value: router.resolve( { name: 'club.setting.ripeMaterial' } )
    },
    {
      label: t('paintFactory'),
      value: router.resolve( { name: 'club.setting.paintFactory' } )
    },
    {
      label: t('colors'),
      value: router.resolve( { name: 'club.setting.color' } )
    },
    {
      label: t('model'),
      value: router.resolve( { name: 'club.setting.model' } )
    },
    {
      label: t('accessory'),
      value: router.resolve( { name: 'club.setting.accessory' } )
    },
    {
      label: t('embroidery'),
      value: router.resolve( { name: 'club.setting.embroidery' } )
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
