<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PAGINATION_DEFAULTS } from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

const emit = defineEmits(['submit']);

// Props
let props = defineProps({
  materials: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
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
  { name: 'name', label: t('tables.unripeMaterial.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.unripeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.unripeMaterial.columns.price'), align: 'left', field: 'price' }
];
const pagination = ref(PAGINATION_DEFAULTS)
function getMaterials() {
  emit('submit', { page: pagination.value.page });
}

const pagesNumber = computed(() => Math.ceil(props.total / pagination.value.rowsPerPage))
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
    :no-data-label="$t('tables.unripeMaterial.header.empty')"
    color="primary"
    row-key="id"
    :pagination="pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-md-center justify-between">
        <div class="q-table__title">{{ $t('tables.unripeMaterial.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'name'">
            {{ props.row.name }}
          </div>

          <div v-if="col.name === 'quantity'">
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
          </div>

          <div v-if="col.name === 'price'">
            <span> {{ props.row.price * props.row.quantity }} </span>
<!--            <span class="text-weight-bolder"> ({{ props.row.budget.currency.symbol }}) </span>-->
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <div
    v-if="total > pagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="loading"
      v-model="pagination.page"
      input-class="text-bold text-black"
      :max="pagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getMaterials"
    />
  </div>
</template>
