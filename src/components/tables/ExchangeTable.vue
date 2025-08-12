<script setup>
import {computed, onMounted, ref, watch} from "vue";
import { useExchange } from "stores/exchange.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatDate, formatFloatToInteger } from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const props = defineProps({
  dateFrom: {
    type: String,
    default: null
  },
  dateTo: {
    type: String,
    default: null
  }
});

const { t } = useI18n();
const $q = useQuasar();
const selectedData = ref({});
const showAcceptModal = ref(false);
const showRejectModal = ref(false);

const columns = [
  { name: 'id', label: t('tables.exchange.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.exchange.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'fromBudget', label: t('tables.exchange.columns.fromBudget'), align: 'left', field: 'fromBudget' },
  { name: 'toBudget', label: t('tables.exchange.columns.toBudget'), align: 'left', field: 'toBudget' },
  { name: 'quantity', label: t('tables.exchange.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'description', label: t('tables.exchange.columns.description'), align: 'left', field: 'description' },
  { name: 'status', label: t('tables.exchange.columns.status'), align: 'left', field: 'status' },
  { name: 'createdBy', label: t('tables.exchange.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'confirmedBy', label: t('tables.exchange.columns.confirmedBy'), align: 'left', field: 'confirmedBy' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useExchange();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};
  if (props.dateFrom) {
    filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  }

  if (props.dateTo) {
    filterProps.createdAtTo = props.dateTo + 'T23:59:59';
  }

  repository.list({...pagination.value, ...filterProps})
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

function clearAction() {
  selectedData.value = {};
}
function refresh () {
  getItems();
}

onMounted(() => {
  refresh();
})

function acceptAction () {
  if (loading.value) return; // Prevent multiple rapid calls

  loading.value = true;
  repository.accept(selectedData.value.id)
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: 'Successfully accepted',
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: 'Error occurred',
      })
    })
    .finally(() => {
      loading.value = false;
      refresh()
    })
}
function rejectAction () {
  if (loading.value) return; // Prevent multiple rapid calls

  loading.value = true;
  repository.reject(selectedData.value.id)
    .then(() => {
      showRejectModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: 'Successfully rejected',
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: 'Error occurred',
      })
    })
    .finally(() => {
      loading.value = false;
      refresh()
    })
}
const totalQuantity = computed(() => {
  return items.value.filter(item => item.status === "accepted").reduce((sum, item) => sum + parseFloat(item.quantity), 0);
})

watch(props, () => {
  getItems();
}, { deep: true });
</script>

<template>
  <q-card class="q-mb-md">
    <q-card-section class="text-h6">
      <div class="text-green">
        {{ $t('total') }}:
      </div>
      {{ formatFloatToInteger(totalQuantity) }}$
    </q-card-section>
  </q-card>

  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.exchange.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.exchange.header.title') }}</div>

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
          <div v-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'fromBudget'">
            {{ props.row.fromBudget.name }} ->
          </div>
          <div v-else-if="col.name === 'toBudget'">
            {{ props.row.toBudget.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ formatFloatToInteger(props.row.quantity) }}
          </div>
          <div v-else-if="col.name === 'status'">
            <div v-if="props.row.status === 'pending'" class="text-red">
              {{ $t('statuses.' + props.row.status) }}
            </div>
            <div v-else-if="props.row.status === 'accepted'" class="text-green">
              {{ $t('statuses.' + props.row.status) }}
            </div>
            <div v-else class="text-red">
              {{ $t('statuses.' + props.row.status) }}
            </div>
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row.createdBy?.fullName }}
          </div>
          <div v-else-if="col.name === 'confirmedBy'">
            {{ props.row.confirmedBy?.fullName }}
          </div>
          <div v-else-if="col.name === 'action' && props.row.status === 'pending'" class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                dense
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-check"
                @click="selectedData = {...props.row}; showAcceptModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('accept') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                dense
                no-caps
                no-wrap
                size="md"
                color="red"
                icon-right="mdi-cancel"
                @click="selectedData = {...props.row}; showRejectModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('reject') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <!-- Dialogs -->
  <q-dialog v-model="showAcceptModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.accept.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.accept.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading"
          :loading="loading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction();"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRejectModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.reject.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.reject.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.reject.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading"
          :loading="loading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="rejectAction()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
