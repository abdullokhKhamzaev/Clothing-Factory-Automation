<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import CutReportList from "components/CutReportList.vue";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";

// Props
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
const {t} = useI18n();
const orderLoading = ref(false);

const columns = [
  {name: 'id', label: '#ID', align: 'left', field: 'id'},
  {name: 'productModel', label: t('tables.modelOrder.columns.productModel'), align: 'left', field: 'productModel'},
  {name: 'productSize', label: t('tables.modelOrder.columns.productSize'), align: 'left', field: 'productSize'},
  {name: 'createdAt', label: t('tables.modelOrder.columns.createdAt'), align: 'left', field: 'createdAt'},
  {name: 'createdBy', label: t('tables.modelOrder.columns.createdBy'), align: 'left', field: 'createdBy'},
  {name: 'productModelOrderCompleteds', label: t('tables.modelOrder.columns.productModelOrderCompleteds'), align: 'left', field: 'productModelOrderCompleteds'},
  {name: 'status', label: t('tables.modelOrder.columns.status'), align: 'left', field: 'status'},
];
</script>

<template>
  <skeleton-table
    :loading="props.loading || orderLoading"
  />
  <q-table
    v-show="!props.loading && !orderLoading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :no-data-label="$t('tables.modelOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.modelOrder.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
          <div v-if="col.name === 'productModel'">
            {{ props.row?.productModel?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'productSize'">
            <div
              v-for="consume in props.row.productSize"
              :key="consume"
            >
              {{ consume.size }} : {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'productModelOrderCompleteds'">
            <q-toggle
              v-if="props.row?.productModelOrderCompleteds.length"
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
          <div v-else-if="col.name === 'status'" :class="props.row.status === 'pending' ? 'text-red' : 'text-orange'">
            {{ $t('statuses.' + props.row.status) }}
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <cut-report-list :lists="props.row.productModelOrderCompleteds" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
