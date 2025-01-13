<script setup>
import { computed, onMounted, ref } from "vue";
import { useRipeMaterialOrder } from "stores/ripeMaterialOrder.js";
import PaintTable from "components/tables/PaintTable.vue";

const order = useRipeMaterialOrder();
const orders = ref([]);
const total = ref(0);
const loading = ref(false);
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
})
const pagesNumber = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage))

function getOrders (filterProps) {
  loading.value = true;

  order.fetchRipeMaterialOrder(filterProps || '')
    .then((res) => {
      orders.value = res.data['hydra:member'];
      total.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  getOrders();
})
</script>

<template>
  <paint-table
    :orders="orders"
    :pagination="pagination"
    :loading="loading"
    @submit="getOrders"
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
      @update:model-value="getOrders({ page: pagination.page })"
    />
  </div>
</template>
