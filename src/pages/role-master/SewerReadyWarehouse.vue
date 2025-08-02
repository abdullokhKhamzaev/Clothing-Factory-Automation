<script setup>
import { useI18n } from "vue-i18n";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";
import ProductInWarehouse from "components/ProductInWarehouse.vue";

const { t } = useI18n();
const sewerWarehouse = '/api/warehouses/5'
const packagerWarehouse = '/api/warehouses/7'

const filtersPending = {
  fromWarehouse: sewerWarehouse,
  toWarehouse: packagerWarehouse,
  status: 'pending',
}

const filters = {
  fromWarehouse: sewerWarehouse,
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
    accept-type="sew"
  />
  <q-separator color="primary" class="q-my-md" />
  <ProductInWarehouse name="sewerWarehouse" />
</template>
