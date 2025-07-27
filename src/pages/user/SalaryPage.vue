<script setup>
import { computed, ref } from "vue";
import UserSalaryCalculation from "components/statistics/UserSalaryCalculation.vue";

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));

const currentYear = now.getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const months = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' }
];

const date = computed(() => String(selectedYear.value) + '-' + String(selectedMonth.value));
</script>

<template>
  <div class="flex justify-between q-card q-mb-md q-pa-sm">
    <q-select
      v-model="selectedYear"
      :options="years"
      label="Yil"
      dense
      outlined
      class="w-full"
    />

    <q-select
      v-model="selectedMonth"
      :options="months"
      emit-value
      option-value="value"
      option-label="label"
      label="Kun"
      dense
      outlined
      class="w-full"
    />
  </div>
  <UserSalaryCalculation :date="date" />
</template>

