<script setup>
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";

const props = defineProps({
  lists: {
    type: Array,
    required: true,
  },
  saleProduct: {
    type: Array,
    required: true,
  },
  customer: {
    type: Object,
    required: true
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
        <div class="flex justify-between text-weight-bold text-h6 text-blue">
          <div> {{ order.createdBy.fullName }} </div>
          <div> -> </div>
          <div> {{ customer.username || customer.fullName }} </div>
        </div>

        <q-separator />

        <q-item
          v-for="sale in props.saleProduct"
          :key="sale.id"
        >
          <q-item-section>
            <div class="text-weight-bold">
              <div> {{ sale.productModel.name }}: </div>
              <div
                class="q-pl-md text-warning"
                v-for="product in sale.quantities"
                :key="product.id"
              >
                {{ product.size }}: {{ product.quantity }} * {{ product.price }} = {{ (product.quantity * product.price).toFixed(1) }} {{ order.budget.name }}
              </div>
            </div>
          </q-item-section>
        </q-item>

        <q-separator />
        <div class="text-primary">
          {{ $t('total') }}: {{ formatFloatToInteger(order.price) }} {{ order.budget.name }}
        </div>
        <div class="text-primary">
          {{ $t('paid') }}: {{ formatFloatToInteger(order.paidPrice) }} {{ order.budget.name }}
        </div>
        <div class="text-red" v-if="order.price - order.paidPrice">
          {{ $t('oweUs') }}: {{ (order.price - order.paidPrice).toFixed(1) }} {{ order.budget.name }}
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>
