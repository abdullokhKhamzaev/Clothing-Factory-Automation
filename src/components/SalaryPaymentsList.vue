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
        <div class="row">
          <div class="col-12 flex justify-between">
            <div :class="order.isIncome ? 'text-green' : 'text-red'">
              {{ order.isIncome ? '+' : '-' }}
              {{ formatFloatToInteger(order.paidPrice) }} {{ order.budget.name }}
            </div>
            <div>
              <q-badge color="teal" :label="'#id ' + order.id" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 flex justify-between text-caption text-grey">
            <div>
              {{ order.createdBy.fullName }}
            </div>
            <div>
              {{ formatDate(order.createdAt) }}
            </div>
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>
