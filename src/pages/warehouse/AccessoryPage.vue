<script setup>
import { computed, onMounted, ref } from "vue";
import { useAccessory } from "stores/accessory.js";
import AccessoryWarehouseTable from "components/tables/AccessoryWarehouseTable.vue";
import RefreshButton from "components/RefreshButton.vue";

const accessory = useAccessory();
const accessories = ref([]);
const accessoryTotal = ref(0);
const accessoryLoading = ref(false);
const accessoryPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const accessoryPagesNumber = computed(() => Math.ceil(accessoryTotal.value / accessoryPagination.value.rowsPerPage));
function getAccessories (filterProps) {
  let props = filterProps || {};

  props.types = ['cutter', 'embroidery', 'sewer', 'packager', 'warehouse']

  accessoryLoading.value = true;
  accessory.fetchAccessories(props || '')
    .then((res) => {
      accessories.value = res.data['hydra:member'];
      accessoryTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      accessoryLoading.value = false;
    });
}

function refresh () {
  accessoryPagination.value = {
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
  };
  getAccessories();
}

onMounted(() => {
  refresh();
})

</script>

<template>
  <div class="q-ma-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>
  <accessory-warehouse-table
    :accessories="accessories"
    :pagination="accessoryPagination"
    :loading="accessoryLoading"
    @submit="refresh"
  />
  <div
    v-if="accessoryTotal > accessoryPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="accessoryLoading"
      v-model="accessoryPagination.page"
      input-class="text-bold text-black"
      :max="accessoryPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getAccessories({ page: accessoryPagination.page })"
    />
  </div>
</template>
