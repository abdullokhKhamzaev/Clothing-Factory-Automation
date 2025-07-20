<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatFloatToInteger } from "../../libraries/constants/defaults.js";
import { useAccessory } from "stores/accessory.js";
import RefreshButton from "components/RefreshButton.vue";

const domain = ref(import.meta.env.VITE_API_DOMEN);
const $q = useQuasar();
const { t } = useI18n();

const columns = [
  { name: 'name', label: t('tables.accessory.columns.name'), align: 'left', field: 'name' },
  { name: 'image', label: t('tables.accessory.columns.image'), align: 'left', field: 'image' },
  { name: 'quantity', label: t('tables.accessory.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.accessory.columns.price'), align: 'left', field: 'price' },
  { name: 'type', label: t('tables.accessory.columns.type'), align: 'left', field: 'type' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useAccessory();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  types: ['cutter', 'embroidery', 'sewer', 'packager', 'warehouse'],
  name: null
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchAccessories({...pagination.value, ...filters.value})
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
    :no-data-label="$t('tables.accessory.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.accessory.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-input
            style="min-width: 225px"
            dense
            outlined
            clearable
            v-model="filters.name"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            :label="$t('tables.users.header.searchTitle')"
            :debounce="1000"
            @update:model-value="getItems"
          >
            <template v-slot:append>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
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
          <div
            v-if="col.name === 'quantity'"
            class="flex no-wrap q-gutter-sm"
          >
            <span> {{ formatFloatToInteger(props.row.quantity) }} </span>
            <span class="text-weight-bolder"> ({{ $t(props.row.measurement) }}) </span>
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price) }}
          </div>
          <div v-else-if="col.name === 'image'">
            <q-img
              v-if="props?.row?.image?.contentUrl"
              :src="domain + props.row.image.contentUrl"
              style="max-width: 50px"
            />
            <div v-else>
              -
            </div>
          </div>
          <div v-else-if="col.name === 'type'">
            {{ $t(props.row.type) }}
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
