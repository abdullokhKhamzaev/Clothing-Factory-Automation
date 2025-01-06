<script setup>
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import ReportList from "components/ReportList.vue";

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
  { name: 'material', label: t('tables.completedUnripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'quantity', label: t('tables.completedUnripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'completedQuantity', label: t('tables.completedUnripeMaterialOrder.columns.completedQuantity'), align: 'left', field: 'completedQuantity' },
  { name: 'completedQuantitySort2', label: t('tables.completedUnripeMaterialOrder.columns.completedQuantitySort2'), align: 'left', field: 'completedQuantitySort2' },
  { name: 'completedRoll', label: t('tables.completedUnripeMaterialOrder.columns.completedRoll'), align: 'left', field: 'completedRoll' },
  { name: 'completedRollSort2', label: t('tables.completedUnripeMaterialOrder.columns.completedRollSort2'), align: 'left', field: 'completedRollSort2' },
  { name: 'expectedConsume', label: t('tables.completedUnripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.completedUnripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'createdBy', label: t('tables.completedUnripeMaterialOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'completedUnripeMaterialOrders', label: t('tables.completedUnripeMaterialOrder.columns.completedUnripeMaterialOrders'), align: 'left', field: 'completedUnripeMaterialOrders' },
];
</script>

<template>
  <skeleton-table :loading="props.loading"/>
  <q-table
    v-show="!props.loading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }} ({{ props.row?.material?.measurement || '-' }})
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <div
              v-for="consume in props.row.expectedConsume"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread }}: {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <div
              v-for="consume in props.row.consumed"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread }}: {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'completedUnripeMaterialOrders'">
            <q-toggle
              v-if="props.row?.completedUnripeMaterialOrders.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders')"
            />
            <span v-else>
              -
            </span>
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <report-list :lists="props.row.completedUnripeMaterialOrders" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
