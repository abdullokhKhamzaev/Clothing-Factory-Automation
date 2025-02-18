<script setup>
import { computed, onMounted, ref } from "vue";
import { useSalary } from "stores/salary.js";
import RefreshButton from "components/RefreshButton.vue";
import SalaryTable from "components/tables/SalaryTable.vue";

const salary = useSalary();
const month = ref(new Date().toISOString().split('T')[0].slice(0, 7));
const salaries = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage));

function getSalaries (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  if (!props.month) {
    props.month = month.value;
  }

  salary.fetchSalaries(props || '')
    .then((res) => {
      salaries.value = res.data['hydra:member'];
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
  if (filter?.month) {
    month.value = filter.month;
    getSalaries({ month: filter.month });
  } else {
    getSalaries();
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
  <salary-table
    :salaries="salaries"
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
      @update:model-value="getSalaries({ page: pagination.page })"
    />
  </div>
</template>

