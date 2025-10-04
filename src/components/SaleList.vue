<script setup>
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";
import { formatDate } from "src/libraries/constants/defaults.js";

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
  },
  oweUs: {
    type: Number,
    required: true
  }
})

// Clean up description by removing redundant parts
const cleanDescription = (description) => {
  if (!description) return null;
  
  // Remove "productSold -> CustomerName" pattern as customer is already shown above
  const cleanedDesc = description.replace(/productSold\s*->.*$/i, '').trim();
  
  // Remove "receivedSaleDebt" pattern as it's obvious from the transaction
  const finalDesc = cleanedDesc.replace(/^receivedSaleDebt\s*#?\d*\s*from\s*/i, '').trim();
  
  // Only return if there's meaningful text left
  return finalDesc.length > 0 ? finalDesc : null;
}
</script>

<template>
  <div class="column q-gutter-sm">
    <!-- Payment Transaction List -->
    <q-list bordered separator>
      <q-item
        v-for="transaction in props.lists"
        :key="transaction.id"
        class="q-pa-md"
      >
        <q-item-section side>
          <q-icon
            :name="transaction.isIncome ? 'mdi-arrow-down-circle' : 'mdi-arrow-up-circle'"
            :color="transaction.isIncome ? 'green' : 'red'"
            size="32px"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label class="row items-center justify-between">
            <div
              class="text-h6 text-weight-bold"
              :class="transaction.isIncome ? 'text-green' : 'text-red'"
            >
              {{ transaction.isIncome ? '+' : '-' }} {{ formatFloatToInteger(transaction.paidPrice) }}
              <span class="text-body2 text-grey-7">{{ transaction.budget.name }}</span>
            </div>
            <q-badge outline color="grey-7" :label="'#' + transaction.id" />
          </q-item-label>

          <q-item-label caption class="q-mt-xs text-grey-6">
            <q-icon name="mdi-clock-outline" size="14px" />
            {{ formatDate(transaction.createdAt) }}
          </q-item-label>

          <div class="q-mt-sm" v-if="cleanDescription(transaction.description)">
            <div class="text-caption text-grey-8">
              <q-icon name="mdi-note-text" size="14px" />
              {{ cleanDescription(transaction.description) }}
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Debt Summary -->
    <q-banner v-if="props.oweUs" class="bg-red-1 text-red" rounded>
      <template v-slot:avatar>
        <q-icon name="mdi-alert-circle" color="red" />
      </template>
      <div class="text-weight-bold">
        {{ $t('oweUs') }}: {{ formatFloatToInteger(oweUs) }} {{ lists[0].budget.name }}
      </div>
    </q-banner>
  </div>
</template>
