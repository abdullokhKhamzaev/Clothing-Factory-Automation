<script setup>
import { formatDate } from "src/libraries/constants/defaults.js";

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
        <q-item-label v-if="Number(order.receivedQuantitySort1) > 0">
          + {{ order.receivedQuantitySort1 }} kg
          <span v-if="Number(order.receivedRollSort1) > 0">
            | {{ order.receivedRollSort1 }} {{ $t('roll') }}
          </span>
          | sort 1
        </q-item-label>
        <q-item-label v-if="Number(order.receivedQuantitySort2) > 0">
          + {{ order.receivedQuantitySort2 }} kg {{ order.receivedRollSort2 }}
          <span v-if="Number(order.receivedRollSort2) > 0">
            | {{ order.receivedRollSort2 }} {{ $t('roll') }}
          </span>
          | sort 2
        </q-item-label>
        <q-item-label caption>{{ order.receivedBy.fullName }}</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <q-badge color="teal" :label="'#id ' + order.id" />
        <q-item-label caption> {{ formatDate(order.receivedAt) }} </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
