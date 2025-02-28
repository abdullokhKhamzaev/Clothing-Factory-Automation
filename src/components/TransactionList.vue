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
  <q-list bordered separator style="max-width: 360px">
    <q-item
      v-for="order in props.lists"
      :key="order.id"
    >
      <q-item-section>
        <div class="flex justify-between" :class="order.isIncome ? 'text-green' : 'text-red'">
          <div>
              {{ order.isIncome ? '+' : '-' }} {{ formatFloatToInteger(order.paidPrice) }} {{ order.budget.name }}
          </div>
          <div>
            <q-badge color="teal" :label="'#id ' + order.id" />
          </div>
        </div>
        <div class="flex justify-between text-grey-10 text-caption">
          <div>
            {{ order.createdBy.fullName }}
          </div>
          <div>
            {{ formatDate(order.createdAt) }}
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>
