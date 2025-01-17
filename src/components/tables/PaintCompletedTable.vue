<script setup>
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";

let props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
});

const { t } = useI18n();

const columns = [
  { name: 'id', label: "#ID", align: 'left', field: 'id' },
  { name: 'sentQuantitySort1', label: t('tables.paint.columns.sentQuantitySort1'), align: 'left', field: 'sentQuantitySort1' },
  { name: 'sentRollSort1', label: t('tables.paint.columns.sentRollSort1'), align: 'left', field: 'sentRollSort1' },
  { name: 'sentQuantitySort2', label: t('tables.paint.columns.sentQuantitySort2'), align: 'left', field: 'sentQuantitySort2' },
  { name: 'sentRollSort2', label: t('tables.paint.columns.sentRollSort2'), align: 'left', field: 'sentRollSort2' },
  { name: 'status', label: t('tables.paint.columns.status'), align: 'left', field: 'status' },
  { name: 'createdBy', label: t('tables.paint.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'receivedBy', label: t('tables.paint.columns.receivedBy'), align: 'left', field: 'receivedBy' },
  { name: 'paintFabric', label: t('tables.paint.columns.paintFabric'), align: 'left', field: 'paintFabric' },
  { name: 'createdAt', label: t('tables.paint.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'receivedAt', label: t('tables.paint.columns.receivedAt'), align: 'left', field: 'receivedAt' },
  { name: 'dealDate', label: t('tables.paint.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'unripeMaterial', label: t('tables.paint.columns.unripeMaterial'), align: 'left', field: 'unripeMaterial' },
  { name: 'ripeMaterialOrderAccepteds', label: t('tables.paint.columns.ripeMaterialOrderAccepteds'), align: 'left', field: 'ripeMaterialOrderAccepteds' },
];
</script>

<template>
  <skeleton-table
    :loading="props.loading"
  />
  <q-table
    v-show="!props.loading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :no-data-label="$t('tables.paint.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.paint.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            <div>
              {{ props.row[col.field] }}
            </div>
          </q-td>
        </q-tr>
      </template>
  </q-table>
</template>
