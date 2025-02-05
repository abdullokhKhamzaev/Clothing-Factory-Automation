<script setup>
const props = defineProps({
  routes: {
    type: Array,
    required: true
  }
});

</script>

<template>
  <q-tabs
    no-caps
    dense
    outside-arrows
    mobile-arrows
    :class="`q-card overflow-hidden bg-primary text-white ${ $q.screen.xs ? 'full-width' : '' }`"
  >
    <q-route-tab
      v-for="( route, routeKey ) in props.routes"
      :key="routeKey"
      :label="route.label"
      :to="route.value"
    />
  </q-tabs>
</template>
