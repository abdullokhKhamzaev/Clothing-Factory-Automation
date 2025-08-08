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
    active-color="primary"
    :class="`shadow-3 overflow-hidden ${ $q.screen.xs ? 'full-width' : '' }`"
  >
    <q-route-tab
      v-for="( route, routeKey ) in props.routes"
      :key="routeKey"
      :label="route.label"
      :to="route.value"
    />
  </q-tabs>
</template>
