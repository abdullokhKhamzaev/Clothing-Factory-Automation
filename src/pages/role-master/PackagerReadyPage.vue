<script setup>
import { useI18n } from "vue-i18n";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();
const packagerWarehouse = '/api/warehouses/7'
const packagerReadyWarehouse = '/api/warehouses/8'

const filtersPending = {
  fromWarehouse: packagerWarehouse,
  toWarehouse: packagerReadyWarehouse,
  status: 'pending',
}

const filters = {
  fromWarehouse: packagerWarehouse,
  statuses: ['accepted', 'rejected'],
}
</script>

<template>
  <ProductInWarehouseAction
    :filters="filtersPending"
    :title="t('waiting')"
    accept-type="embroidery"
    :can-accept="true"
    :can-reject="true"
  />
  <q-separator color="primary" class="q-my-md" />
  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
    accept-type="package"
  />
  <q-separator color="primary" class="q-my-md" />
  <ProductInWarehouse name="sewerWarehouse" />
</template>
