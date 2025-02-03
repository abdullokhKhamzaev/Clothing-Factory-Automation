<script setup>
import { computed, onMounted, ref } from "vue";
import { useSale } from "stores/sale.js";
import SaleTable from "components/tables/SaleTable.vue";

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
function getSales (filterProps) {
  let props = filterProps || {};
  saleLoading.value = true;
  sale.fetchSales(props || '')
    .then((res) => {
      sales.value = res.data['hydra:member'];
      saleTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      saleLoading.value = false;
    });
}

function refresh () {
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
      @update:model-value="getSales({ page: salePagination.page })"
    />
  </div>
</template>
