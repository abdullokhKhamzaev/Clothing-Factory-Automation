<script setup>
import { useI18n } from "vue-i18n";
import {onMounted, ref} from "vue";
import {useCutterRipeMaterialWarehouse} from "stores/cutterRipeMaterialWarehouse.js";
import RefreshButton from "components/RefreshButton.vue";

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

const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useCutterRipeMaterialWarehouse();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  // ...
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.list({...pagination.value, ...filters.value})
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
    :no-data-label="$t('tables.cutterRipeMaterial.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.cutterRipeMaterial.header.title') }}</div>

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
