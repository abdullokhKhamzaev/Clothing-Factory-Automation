<script setup>
import SkeletonTable from "components/tables/SkeletonTable.vue";
import { useI18n } from "vue-i18n";

let props = defineProps({
  materials: {
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
  { name: 'ripeMaterial', label: t('tables.cutterRipeMaterial.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'quantity', label: t('tables.cutterRipeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.cutterRipeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.cutterRipeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.cutterRipeMaterial.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'remainingSort1', label: t('tables.cutterRipeMaterial.columns.remainingSort1'), align: 'left', field: 'remainingSort1' },
  { name: 'remainingSort2', label: t('tables.cutterRipeMaterial.columns.remainingSort2'), align: 'left', field: 'remainingSort2' }
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
    :rows="props.materials"
    :columns="columns"
    :no-data-label="$t('tables.repaint.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-md-center justify-between">
        <div class="q-table__title">{{ $t('tables.cutterRipeMaterial.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'ripeMaterial'">
            {{props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ Number(props.row.quantity) > 0 ? `${props.row.quantity} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'roll'">
            {{ Number(props.row.roll) > 0 ? props.row.roll : '-' }}
          </div>
          <div v-else-if="col.name === 'quantitySort2'">
            {{ Number(props.row.quantitySort2) > 0 ? `${props.row.quantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'rollSort2'">
            {{ Number(props.row.rollSort2) > 0 ? props.row.rollSort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'remainingSort1'">
            {{ Number(props.row.remainingSort1) > 0 ? `${props.row.remainingSort1} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'remainingSort2'">
            {{ Number(props.row.remainingSort2) > 0 ? `${props.row.remainingSort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
