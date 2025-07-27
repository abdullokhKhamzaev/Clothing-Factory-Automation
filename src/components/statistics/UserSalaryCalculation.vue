<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useAbout} from "stores/user/about.js";
import {useWorkEntries} from "stores/workEntries.js";
import RefreshButton from "components/RefreshButton.vue";
import {formatDate, formatFloatToInteger, isToday} from "../../libraries/constants/defaults.js";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const user = useAbout();
const props = defineProps({
  date: {
    type: String,
    required: true,
  }
})
const columns = [
  { name: 'createdAt', label: t('tables.workEntry.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'workerBy', label: t('tables.workEntry.columns.workerBy'), align: 'left', field: 'workerBy' },
  { name: 'productAccessory', label: t('tables.workEntry.columns.productAccessory'), align: 'left', field: 'productAccessory' },
  { name: 'embroidery', label: t('tables.workEntry.columns.embroidery'), align: 'left', field: 'embroidery' },
  { name: 'quantity', label: t('tables.workEntry.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'unitPrice', label: t('tables.workEntry.columns.unitPrice'), align: 'left', field: 'unitPrice' },
  { name: 'totalPrice', label: t('tables.workEntry.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'confirmedBy', label: t('tables.workEntry.columns.confirmedBy'), align: 'left', field: 'confirmedBy' },
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useWorkEntries();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

let filters = ref({
  date: props.date,
  status: 'accepted',
  unitPrice: 0,
  rowsPerPage: '~'
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

const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + Number(item.totalPrice), 0)
})

watch([user, props], () => {
  filters.value.workerBy = user.about['@id'];
  filters.value.date = props.date;
  refresh();
}, {deep: true});

onMounted(async () => {
  await user.fetchAbout();
})
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.workEntry.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.workEntry.header.title') }}</div>

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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
          <div v-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'workerBy'">
            {{ props.row.workerBy.fullName }}
          </div>
          <div v-else-if="col.name === 'productAccessory'">
            {{ props.row.productAccessory?.productSize?.productModel?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'embroidery'">
            {{ props.row.embroidery?.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ formatFloatToInteger(props.row.quantity) }} {{ $t('piece').toLowerCase() }}
          </div>
          <div v-else-if="col.name === 'unitPrice'">
            {{ formatFloatToInteger(props.row.unitPrice) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'totalPrice'">
            {{ formatFloatToInteger(props.row.totalPrice) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'confirmedBy'">
            {{ props.row.confirmedBy.fullName }}
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
    <template v-slot:bottom-row>
      <div class="q-ma-md text-primary text-h6 flex text-no-wrap">
        {{ $t('total') }}: {{ formatFloatToInteger(totalQuantity) }} SO'M
      </div>
    </template>
  </q-table>
</template>
