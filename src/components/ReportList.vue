<script setup>
const props = defineProps({
  lists: {
    type: Array,
    required: true,
  }
})
</script>

<template>
  <div
    v-for="order in props.lists"
    :key="order.id"
  >
    <q-badge outline :color="order.status === 'accepted' ? 'green' : 'red' " :label="$t('statuses.' + order.status)" />

    <div>{{ order.quantity }} || {{ order.roll }}</div>
    <div>{{ order.quantitySort2 }} || {{ order.rollSort2 }}</div>
    <div
      v-for="consume in order.consumed"
      :key="consume"
    >
      {{ consume.thread }}: {{ consume.quantity }}
    </div>
    <q-separator class="q-my-sm" />
  </div>
</template>
