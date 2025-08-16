<script setup>
import { useI18n } from "vue-i18n";
import { isSuperAdmin } from "src/router/routes.js";
import { WAREHOUSES } from "src/libraries/constants/defaults.js";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();

const filters = {
  fromWarehouses: [WAREHOUSES.embroideryWarehouse, WAREHOUSES.embroideryReadyWarehouse]
}
</script>

<template>
  <ProductInWarehouse
    name="embroideryReadyWarehouse"
    show-action
    :can-update="isSuperAdmin()"
    can-send-to-sew
  />

  <q-separator color="primary" class="q-my-md" />

  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
    can-accept
    can-reject
  />
</template>
