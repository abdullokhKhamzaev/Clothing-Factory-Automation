<script setup>
import {onMounted, ref} from "vue";
import { useI18n } from "vue-i18n";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import {useRipeMaterialRepaint} from "stores/ripeMaterialRepaint.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();

const selectedData = ref({});
const showReceiveModal = ref(false);

const columns = [
  { name: 'id', label: "#ID", align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.repaint.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'receivedAt', label: t('tables.repaint.columns.receivedAt'), align: 'left', field: 'receivedAt' },
  { name: 'ripeMaterial', label: t('tables.repaint.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'createdBy', label: t('tables.repaint.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'receivedBy', label: t('tables.repaint.columns.receivedBy'), align: 'left', field: 'receivedBy' },
  { name: 'paintFabric', label: t('tables.repaint.columns.paintFabric'), align: 'left', field: 'paintFabric' },
  { name: 'sentQuantitySort1', label: t('tables.repaint.columns.sentQuantitySort1'), align: 'left', field: 'sentQuantitySort1' },
  { name: 'receivedQuantitySort1', label: t('tables.repaint.columns.receivedQuantitySort1'), align: 'left', field: 'receivedQuantitySort1' },
  { name: 'sentRollSort1', label: t('tables.repaint.columns.sentRollSort1'), align: 'left', field: 'sentRollSort1' },
  { name: 'receivedRollSort1', label: t('tables.repaint.columns.receivedRollSort1'), align: 'left', field: 'receivedRollSort1' },
  { name: 'sentQuantitySort2', label: t('tables.repaint.columns.sentQuantitySort2'), align: 'left', field: 'sentQuantitySort2' },
  { name: 'receivedQuantitySort2', label: t('tables.repaint.columns.receivedQuantitySort2'), align: 'left', field: 'receivedQuantitySort2' },
  { name: 'sentRollSort2', label: t('tables.repaint.columns.sentRollSort2'), align: 'left', field: 'sentRollSort2' },
  { name: 'receivedRollSort2', label: t('tables.repaint.columns.receivedRollSort2'), align: 'left', field: 'receivedRollSort2' },
  { name: 'dealDate', label: t('tables.paint.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'status', label: t('tables.repaint.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];

const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useRipeMaterialRepaint();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  status: 'received'
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchRepaintOrders({...pagination.value, ...filters.value})
    .then((res) => {
      items.value = res.data['hydra:member'];
      pagination.value.rowsNumber = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

function onRequest(params) {
  pagination.value = {...pagination.value, ...params.pagination};
  getItems();
}
function refresh () {
  getItems();
}

onMounted(() => {
  refresh();
})
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.repaint.header.empty')"
    :columns="columns"
    :visible-columns="visibleColumns"
    :rows="items"
    row-key="id"
    v-model:pagination.sync="pagination"
    :rows-per-page-options="[10, 25, 50, 100, '~']"
    :loading="loading"
    @request="onRequest"
  >
    <template v-slot:top>
      <div class="col-12 q-gutter-y-sm" :class="$q.screen.lt.sm ? '' : 'flex'">
        <div class="q-table__title">{{ $t('tables.repaint.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-select
            dense
            multiple
            outlined
            options-dense
            emit-value
            map-options
            v-model="visibleColumns"
            :display-value="$q.lang.table.columns"
            :options="columns"
            option-value="name"
            :label="$t('columns')"
            class="w-full"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-2 text-black'">
          <div v-if="col.name === 'action' && props.row.status === 'expected'" class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                size="md"
                no-caps
                dense
                :label="$t('receive')"
                color="green"
                @click="showReceiveModal = true; selectedData = {...props.row}"
              />
            </div>
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'receivedAt'">
            {{ formatDate(props.row.receivedAt) }}
          </div>
          <div v-else-if="col.name === 'ripeMaterial'">
            {{props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row.createdBy.fullName }}
          </div>
          <div v-else-if="col.name === 'receivedBy'">
            {{ props.row.receivedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'paintFabric'">
            {{ props.row.paintFabric.name }}
          </div>
          <div v-else-if="col.name === 'sentQuantitySort1'">
            {{ Number(props.row.sentQuantitySort1) > 0 ? `${props.row.sentQuantitySort1} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'receivedQuantitySort1'">
            {{ Number(props.row.receivedQuantitySort1) > 0 ? `${props.row.receivedQuantitySort1} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'sentRollSort1'">
            {{ Number(props.row.sentRollSort1) > 0 ? props.row.sentRollSort1 : '-' }}
          </div>
          <div v-else-if="col.name === 'receivedRollSort1'">
            {{ Number(props.row.receivedRollSort1) > 0 ? props.row.receivedRollSort1 : '-' }}
          </div>
          <div v-else-if="col.name === 'sentQuantitySort2'">
            {{ Number(props.row.sentQuantitySort2) > 0 ? `${props.row.sentQuantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'receivedQuantitySort2'">
            {{ Number(props.row.receivedQuantitySort2) > 0 ? `${props.row.receivedQuantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'sentRollSort2'">
            {{ Number(props.row.sentRollSort2) > 0 ? props.row.sentRollSort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'receivedRollSort2'">
            {{ Number(props.row.receivedRollSort2) > 0 ? props.row.receivedRollSort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'dealDate'">
            {{ formatDate(props.row.dealDate).slice(0,10) }}
          </div>
          <div v-else-if="col.name === 'status'">
            <span class="text-bold" :class="props.row.status === 'expected' ? 'text-warning' : 'text-green'">
              {{ $t('statuses.' + props.row.status) }}
            </span>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
