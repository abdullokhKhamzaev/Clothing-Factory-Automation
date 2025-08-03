<script setup>
import { useI18n } from "vue-i18n";
import { WAREHOUSES } from "src/libraries/constants/defaults.js";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();
const filters = {
  fromWarehouse: WAREHOUSES.cutterWarehouse,
}
</script>

<template>
  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
  />
  <q-separator color="primary" class="q-my-md" />
  <ProductInWarehouse
    name="cutterWarehouse"
    :from-warehouse="WAREHOUSES.cutterWarehouse"
    show-action
    can-send-to-embroidery
    can-send-to-sew
  />
</template>
