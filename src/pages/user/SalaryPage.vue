<script setup>
import { ref } from "vue";
import UserSalaryCalculation from "components/statistics/UserSalaryCalculation.vue";
import DateFilter from "components/DateFilter.vue";
import { date } from "quasar";

// Initialize with current date
const selectedDate = ref(date.formatDate(Date.now(), 'YYYY-MM'));

// Handle date changes from filter
function onDateChange(dateData) {
  selectedDate.value = dateData;
}
</script>

<template>
  <!-- Enhanced Date Filter -->
  <date-filter
    v-model="selectedDate"
    @date-changed="onDateChange"
  />

  <!-- User Salary Calculation -->
  <UserSalaryCalculation :date="selectedDate" />
</template>

