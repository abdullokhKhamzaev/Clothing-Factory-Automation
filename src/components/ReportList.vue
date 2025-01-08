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
    <div class="text-bold text-subtitle2 q-mt-xs">
      {{ $t('tables.unripeMaterialOrder.columns.completedQuantity') }}:
    </div>

    <div
      v-if="order.quantity > 0"
    > Sort 1: {{ order.quantity }} || {{ $t('tables.unripeMaterialOrder.columns.completedRoll') }}: {{ order.roll }} </div>
    <div
      v-if="order.quantitySort2 > 0"
      class="text-warning"
    > Sort 2: {{ order.quantitySort2 }} || {{ $t('tables.unripeMaterialOrder.columns.completedRoll') }}: {{ order.rollSort2 }}
    </div>
    <div class="text-bold text-subtitle2 q-mt-xs rounded-borders	">
      {{ $t('tables.unripeMaterialOrder.columns.consumed') }}:
    </div>
    <div
      v-for="consume in order.consumed"
      :key="consume"
    >
      {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.thread.measurement }}
    </div>
    <q-separator class="q-my-sm" />
  </div>
</template>
