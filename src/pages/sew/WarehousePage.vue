<script setup>
import { useI18n } from "vue-i18n";
import { isSuperAdmin } from "src/router/routes.js";
import { WAREHOUSES } from "src/libraries/constants/defaults.js";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();

const filters = {
  fromWarehouses: [WAREHOUSES.sewerWarehouse, WAREHOUSES.embroideryReadyWarehouse]
}
</script>

<template>
  <ProductInWarehouse
    name="sewerWarehouse"
    show-action
    :can-update="isSuperAdmin"
  />

  <q-separator color="primary" class="q-my-md" />

  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
    can-accept
    can-reject
  />
</template>
