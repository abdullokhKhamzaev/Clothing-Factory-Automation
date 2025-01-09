<script setup>
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
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
  { name: 'name', label: t('tables.ripeMaterial.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.ripeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.ripeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.ripeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.ripeMaterial.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'price', label: t('tables.ripeMaterial.columns.price'), align: 'left', field: 'price' }
];
</script>

<template>
  <skeleton-table
    :loading="props.loading"
  />
  <q-table
    v-show="!loading"
    flat
    bordered
    :rows="props.materials"
    :columns="columns"
    :no-data-label="$t('tables.ripeMaterial.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-md-center justify-between">
        <div class="q-table__title">{{ $t('tables.ripeMaterial.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'name'">
            {{ props.row.name }}
          </div>

          <div v-else-if="col.name === 'quantity'">
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
          </div>

          <div v-else-if="col.name === 'price'">
            <span> {{ props.row.price * props.row.quantity }} </span>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
