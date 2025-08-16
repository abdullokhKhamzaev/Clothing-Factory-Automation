<script setup>
import { useI18n } from "vue-i18n";
import { isSuperAdmin } from "src/router/routes.js";
import { WAREHOUSES } from "src/libraries/constants/defaults.js";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();

const filters = {
  toWarehouse: WAREHOUSES.cutterWarehouseDefective,
}
</script>

<template>
  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
    can-accept
    can-reject
  />

  <q-separator color="primary" class="q-my-md" />

  <ProductInWarehouse
    name="cutterDefectiveWarehouse"
    show-action
    :can-update="isSuperAdmin()"
  />
</template>
