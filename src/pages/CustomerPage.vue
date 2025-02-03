<script setup>
import { computed, onMounted, ref } from "vue";
import { useCustomer } from "stores/customer.js";
import CustomerTable from "components/tables/CustomerTable.vue";

const customer = useCustomer();
const customers = ref([]);
const customerTotal = ref(0);
const customerLoading = ref(false);
const customerPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const customerPagesNumber = computed(() => Math.ceil(customerTotal.value / customerPagination.value.rowsPerPage));
function getCustomers (filterProps) {
  let props = filterProps || {};
  customerLoading.value = true;
  customer.fetchCustomers(props || '')
    .then((res) => {
      customers.value = res.data['hydra:member'];
      customerTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      customerLoading.value = false;
    });
}

function refresh () {
  customerPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getCustomers();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <customer-table
    :customers="customers"
    :pagination="customerPagination"
    :loading="customerLoading"
    @submit="refresh"
  />
  <div
    v-if="customerTotal > customerPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="customerLoading"
      v-model="customerPagination.page"
      input-class="text-bold text-black"
      :max="customerPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getCustomers({ page: customerPagination.page })"
    />
  </div>
</template>
