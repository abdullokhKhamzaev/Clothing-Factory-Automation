<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PAGINATION_DEFAULTS } from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import ReportList from "components/ReportList.vue";

// Props
let props = defineProps({
  orders: {
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
const emit = defineEmits(['submit']);
const { t } = useI18n();

const columns = [
  { name: 'id', label: t('tables.unripeMaterialOrder.columns.id'), align: 'left', field: 'id' },
  { name: 'material', label: t('tables.unripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'createdAt', label: t('tables.unripeMaterialOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.unripeMaterialOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'quantity', label: t('tables.unripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'completedQuantitySort2', label: t('tables.unripeMaterialOrder.columns.completedQuantitySort2'), align: 'left', field: 'completedQuantitySort2' },
  { name: 'completedRoll', label: t('tables.unripeMaterialOrder.columns.completedRoll'), align: 'left', field: 'completedRoll' },
  { name: 'completedRollSort2', label: t('tables.unripeMaterialOrder.columns.completedRollSort2'), align: 'left', field: 'completedRollSort2' },
  { name: 'completedQuantity', label: t('tables.unripeMaterialOrder.columns.completedQuantity'), align: 'left', field: 'completedQuantity' },
  { name: 'expectedConsume', label: t('tables.unripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.unripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'completedUnripeMaterialOrders', label: t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders'), align: 'left', field: 'completedUnripeMaterialOrders' },
  { name: 'status', label: t('tables.unripeMaterialOrder.columns.status'), align: 'left', field: 'status' },
];
const pagination = ref(PAGINATION_DEFAULTS)

function getOrders () {
  emit('submit', { page: pagination.value.page });
}

const pagesNumber = computed(() => Math.ceil(props.total / pagination.value.rowsPerPage))
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
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.unripeMaterialOrder.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <span
              v-for="consume in props.row.expectedConsume"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread }}: {{ consume.quantity }}
            </span>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <span
              v-for="consume in props.row.consumed"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread }}: {{ consume.quantity }}
            </span>
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
          <div v-else-if="col.name === 'status'">
            <q-linear-progress
              stripe
              rounded
              size="15px" :value="100" color="green"
              style="min-width: 100px"
            />
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
      @update:model-value="getOrders"
    />
  </div>
</template>
