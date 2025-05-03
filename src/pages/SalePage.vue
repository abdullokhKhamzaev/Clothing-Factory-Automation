<script setup>
import { computed, onMounted, ref } from "vue";
import { useSale } from "stores/sale.js";
import SaleTable from "components/tables/SaleTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const sale = useSale();
const sales = ref([]);
const saleTotal = ref(0);
const saleLoading = ref(false);
const salePagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const salePagesNumber = computed(() => Math.ceil(saleTotal.value / salePagination.value.rowsPerPage));

const filters = ref({})

function getSales (filterProps) {
  saleLoading.value = true;

  sale.fetchSales(filterProps || filters.value)
    .then((res) => {
      sales.value = res.data['hydra:member'];
      saleTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      saleLoading.value = false;
    });
}

function refresh (props) {
  if (props) {
    Object.assign(filters.value, props);
  }

  salePagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getSales();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <sale-table
    :sales="sales"
    :pagination="salePagination"
    :loading="saleLoading"
    @submit="refresh"
  />
  <div
    v-if="saleTotal > salePagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="saleLoading"
      v-model="salePagination.page"
      input-class="text-bold text-black"
      :max="salePagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getSales({ ...filters, page: salePagination.page })"
    />
  </div>
</template>
