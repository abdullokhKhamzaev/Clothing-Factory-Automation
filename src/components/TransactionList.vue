<script setup>
import { formatDate, formatFloatToInteger } from "src/libraries/constants/defaults.js";

const props = defineProps({
  lists: {
    type: Array,
    required: true,
  }
})
</script>

<template>
  <q-list bordered separator style="max-width: 300px">
    <q-item
      v-for="order in props.lists"
      :key="order.id"
    >
      <q-item-section>
        <q-item-label :class="order.isIncome ? 'text-green' : 'text-red'">
          <span>
            {{ order.isIncome ? '+' : '-' }}
          </span>
          {{ formatFloatToInteger(order.paidPrice) }} {{ order.budget.name }}
        </q-item-label>
        <q-item-label caption>{{ order.createdBy.fullName }}</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <q-badge color="teal" :label="'#id ' + order.id" />
        <q-item-label caption> {{ formatDate(order.createdAt) }} </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
