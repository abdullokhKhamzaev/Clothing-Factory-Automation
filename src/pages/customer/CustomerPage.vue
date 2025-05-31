<script setup>
import { useRoute } from "vue-router";
import {computed, onMounted, ref} from "vue";
import { useCustomer } from "stores/customer.js";
import { useSale } from "stores/sale.js";
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";
import SaleTable from "components/tables/SaleTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const route = useRoute();
const customer = ref();
const customerSales = ref();

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
const filters = ref({id: route.params.id})

useCustomer().fetchCustomer(route.params.id)
  .then((res) => {
    customer.value = res.data;
    useSale().fetchSalesAll({
      id: route.params.id,
      customer: customer.value.fullName,
      isPayed: false
    }).then((res) => {
      customerSales.value = res.data['hydra:member'];
    })
  })

const oweByCurrency = computed(() => {
  const map = {};

  if (!customerSales.value) {
    return null
  }

  customerSales.value.forEach((sale) => {
    const total = parseFloat(sale.totalPrice || 0);
    const paid = parseFloat(sale.paidPrice || 0);
    const debt = total - paid;
    const currency = sale.budget?.name || 'Unknown';

    if (!map[currency]) {
      map[currency] = 0;
    }

    map[currency] += debt;
  });

  return Object.entries(map).map(([currency, amount]) => ({
    currency,
    quantity: amount.toFixed(2),
  }));
});

function getSales (filterProps) {
  saleLoading.value = true;

  useSale().fetchSales(filterProps || filters.value)
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
  <div class="flex justify-between items-center">
    <div class="text-h6"> {{ customer?.fullName }} </div>
    <div class="text-bold text-red">
      {{ $t('oweUs') }}: <span v-for="(owe, i) in oweByCurrency" :key="i"> {{ formatFloatToInteger(owe.quantity) }} {{ owe.currency }} </span>
    </div>
  </div>
  <q-separator class="q-mt-sm" />

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
