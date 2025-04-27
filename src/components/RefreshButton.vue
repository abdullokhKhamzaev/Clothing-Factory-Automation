<script setup>
const props = defineProps({
  action: {
    type: Function,
    required: true
  },
  dense: {
    type: Boolean,
    required: false,
    default: false
  },
});

</script>

<template>
  <q-btn :dense="dense" size="md" icon="mdi-orbit-variant" color="dark" @click="props.action()" />
</template>
