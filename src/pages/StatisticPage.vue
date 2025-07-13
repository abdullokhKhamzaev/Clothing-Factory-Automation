<script setup>
import { ref } from "vue";
import { DATE_FORMAT } from "src/libraries/constants/defaults.js";
import AllReports from "components/statistics/AllReports.vue";

const dateFrom = ref(new Date().toISOString().split('T')[0]);
const dateTo = ref(new Date().toISOString().split('T')[0]);
</script>


<template>
  <div class="flex justify-between q-card q-mb-md q-pa-sm">
    <q-btn outline icon="event" :label="dateFrom" color="primary">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="dateFrom" :mask="DATE_FORMAT">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Close" color="primary" flat />
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>
    <q-btn outline icon="event" :label="dateTo" color="primary">
      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
        <q-date v-model="dateTo" :mask="DATE_FORMAT">
          <div class="row items-center justify-end">
            <q-btn v-close-popup label="Close" color="primary" flat />
          </div>
        </q-date>
      </q-popup-proxy>
    </q-btn>
  </div>

  <AllReports :date-from="dateFrom" :date-to="dateTo" />
</template>

