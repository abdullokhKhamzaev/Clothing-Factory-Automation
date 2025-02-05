<script setup>
const props = defineProps({
  action: {
    type: Function,
    required: true
  }
});

</script>

<template>
  <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="props.action()" />
</template>
