<script setup>
import {useI18n} from "vue-i18n";
import {WAREHOUSES} from "src/libraries/constants/defaults.js";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();
const filters = {
  fromWarehouses: [WAREHOUSES.embroideryWarehouse, WAREHOUSES.embroideryReadyWarehouse]
}
</script>

<template>
  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
  />

  <q-separator color="primary" class="q-my-md" />

  <ProductInWarehouse
    :from-warehouse="WAREHOUSES.packagerReadyWarehouse"
    name="embroideryReadyWarehouse"
    show-action
    can-send-to-sew
  />
</template>
