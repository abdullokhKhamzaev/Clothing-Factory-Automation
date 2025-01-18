<script setup>
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import PaintReportList from "components/PaintReportList.vue";

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
  { name: 'createdAt', label: t('tables.paint.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.paint.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'receivedBy', label: t('tables.paint.columns.receivedBy'), align: 'left', field: 'receivedBy' },
  { name: 'unripeMaterial', label: t('tables.paint.columns.unripeMaterial'), align: 'left', field: 'unripeMaterial' },
  { name: 'paintFabric', label: t('tables.paint.columns.paintFabric'), align: 'left', field: 'paintFabric' },
  { name: 'sentQuantitySort1', label: t('tables.paint.columns.sentQuantitySort1'), align: 'left', field: 'sentQuantitySort1' },
  { name: 'sentRollSort1', label: t('tables.paint.columns.sentRollSort1'), align: 'left', field: 'sentRollSort1' },
  { name: 'sentQuantitySort2', label: t('tables.paint.columns.sentQuantitySort2'), align: 'left', field: 'sentQuantitySort2' },
  { name: 'sentRollSort2', label: t('tables.paint.columns.sentRollSort2'), align: 'left', field: 'sentRollSort2' },
  { name: 'dealDate', label: t('tables.paint.columns.dealDate'), align: 'left', field: 'dealDate' },
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
          <div v-if="col.name === 'createdBy'">
            {{ props.row.createdBy.fullName }}
          </div>
          <div v-else-if="col.name === 'receivedBy'">
            {{ props.row.receivedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'unripeMaterial'">
            {{ props.row.unripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'paintFabric'">
            {{ props.row.paintFabric.name }}
          </div>
          <div v-else-if="col.name === 'sentQuantitySort1'">
            {{ Number(props.row.sentQuantitySort1) > 0 ? props.row.sentQuantitySort1 : '-' }}
          </div>
          <div v-else-if="col.name === 'sentRollSort1'">
            {{ Number(props.row.sentRollSort1) > 0 ? props.row.sentRollSort1 : '-' }}
          </div>
          <div v-else-if="col.name === 'sentQuantitySort2'">
            {{ Number(props.row.sentQuantitySort2) > 0 ? props.row.sentQuantitySort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'sentRollSort2'">
            {{ Number(props.row.sentRollSort2) > 0 ? props.row.sentRollSort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'ripeMaterialOrderAccepteds'">
            <q-toggle
              v-if="props.row?.ripeMaterialOrderAccepteds.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.paint.columns.ripeMaterialOrderAccepteds')"
            />
            <span v-else> - </span>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <paint-report-list :lists="props.row.ripeMaterialOrderAccepteds" />
        </q-td>
      </q-tr>
      </template>
  </q-table>
</template>
