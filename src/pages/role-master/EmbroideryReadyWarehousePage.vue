<script setup>
import { useI18n } from "vue-i18n";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();
const embroideryWarehouse = '/api/warehouses/3';
const embroideryReadyWarehouse = '/api/warehouses/4';
const sewerWarehouse = '/api/warehouses/5';

const filtersPending = {
  fromWarehouses: [embroideryWarehouse, embroideryReadyWarehouse],
  toWarehouses: [sewerWarehouse, embroideryReadyWarehouse],
  status: 'pending',
}

const filters = {
  fromWarehouses: [embroideryWarehouse, embroideryReadyWarehouse],
  toWarehouses: [sewerWarehouse, embroideryReadyWarehouse],
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
  />
  <q-separator color="primary" class="q-my-md" />
  <ProductInWarehouse name="embroideryWarehouse" />
</template>
