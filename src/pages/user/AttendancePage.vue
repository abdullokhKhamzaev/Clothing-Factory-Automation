<script setup>
import { computed, onMounted, ref } from "vue";
import { useAttendance } from "stores/attendance.js";
import RefreshButton from "components/RefreshButton.vue";
import AttendanceTable from "components/tables/AttendanceTable.vue";

const attendance = useAttendance();
const date = ref(new Date().toISOString().split('T')[0])
const attendances = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage));

function getAttendances (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  if (!props.date) {
    props.date = date.value;
  }

  attendance.fetchAttendances(props || '')
    .then((res) => {
      attendances.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

function refresh (filter) {
  pagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };

  if (filter?.date) {
    date.value = filter.date;
    getAttendances({ date: filter.date });
  } else {
    getAttendances();
  }
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-mb-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <attendance-table
    :attendances="attendances"
    :pagination="pagination"
    :loading="loading"
    @submit="refresh"
  />
  <div
    v-if="total > pagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="loading"
      v-model="pagination.page"
      input-class="text-bold text-black"
      :max="pagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getAttendances({ page: pagination.page })"
    />
  </div>
</template>

