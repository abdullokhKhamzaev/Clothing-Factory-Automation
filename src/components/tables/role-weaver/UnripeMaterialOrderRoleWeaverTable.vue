<script setup>
import {onMounted, ref} from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { useCompletedUnripeMaterialOrders } from "stores/completedUnripeMaterialOrders.js";
import { useThread } from "stores/thread.js";
import ReportList from "components/ReportList.vue";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const thread = useThread();
const selectedData = ref({});
const whichSort = ref(null);
const rows = ref([{ thread: '', quantity: '' }]);

const showAcceptModal = ref(false);
const showOrderReportModal = ref(false);
const reportActionErr = ref(null);
const orderLoading = ref(false);

const columns = [
  { name: 'id', label: t('tables.unripeMaterialOrder.columns.id'), align: 'left', field: 'id' },
  { name: 'material', label: t('tables.unripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'createdAt', label: t('tables.unripeMaterialOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'status', label: t('tables.unripeMaterialOrder.columns.status'), align: 'left', field: 'status' },
  { name: 'createdBy', label: t('tables.unripeMaterialOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'quantity', label: t('tables.unripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'expectedConsume', label: t('tables.unripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.unripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'completedUnripeMaterialOrders', label: t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders'), align: 'left', field: 'completedUnripeMaterialOrders' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useUnripeMaterialOrder();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  statuses: ['confirmed', 'pending']
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchUnripeMaterialOrder({...pagination.value, ...filters.value})
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

function shouldShowAction(data) {
  return !data.some(order => order.status === 'notAccepted');
}
function clearAction() {
  selectedData.value = {};
  rows.value = [{ thread: '', quantity: '' }];
  whichSort.value = null;
  reportActionErr.value = null;
}
function confirmOrder() {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }

  orderLoading.value = true;

  repository.confirmUnripeMaterialOrder(selectedData.value.id)
    .then(() => {
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successCreated')
      })
      showAcceptModal.value = false;
      refresh();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false);
}
function reportOrderAction() {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }

  orderLoading.value = true;

  let consumed = [];

  rows.value.forEach((consume) => {
    consumed.push({ thread: consume.thread, quantity: consume.quantity })
  })

  let input  = {
    unripeMaterialOrder: selectedData.value['@id'],
    consumedDtos: consumed
  }

  if ( whichSort.value.value === 1 ) {
    input.quantity = String(selectedData.value.completedOrderQuantity);
    input.roll = selectedData.value.completedOrderRoll;
    input.quantitySort2 = '0';
    input.rollSort2 = 0;
  } else if ( whichSort.value.value === 2 ) {
    input.quantity = '0';
    input.roll = 0;
    input.quantitySort2 = String(selectedData.value.completedOrderQuantity);
    input.rollSort2 = selectedData.value.completedOrderRoll;
  }

  useCompletedUnripeMaterialOrders().createCompletedUnripeMaterialOrders(input)
    .then(() => {
      showOrderReportModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      reportActionErr.value = res.response.data['hydra:description'];
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}
function prefill () {
  let consumes = [];
  selectedData.value.expectedConsume.forEach((consume) => {
    consumes.push({ thread: consume.thread['@id'], quantity: 0 })
  })
  rows.value = consumes;
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.unripeMaterialOrder.header.title') }}</div>

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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green'">
          <div v-if="col.name === 'action'" class="flex justify-end">
            <q-btn
              v-if="props.row.status !== 'confirmed'"
              no-caps
              dense
              :label="$t('accept')"
              size="md"
              color="green"
              @click="selectedData = {...props.row}; showAcceptModal = true"
            />
            <q-btn
              v-else-if="shouldShowAction(props.row.completedUnripeMaterialOrders)"
              dense
              no-caps
              no-wrap
              size="md"
              color="orange"
              :label="$t('report')"
              @click="selectedData = {...props.row}; prefill(); showOrderReportModal = true;"
            />
          </div>
          <div v-else-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'status'" class="text-orange">
            <span :class="props.row.status === 'pending' ? 'text-red' : 'text-orange'">
              {{ $t('statuses.' + props.row.status) }}
            </span>
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <div
              v-for="consume in props.row.expectedConsume"
              :key="consume"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </div>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <div
              v-for="consume in props.row.consumed"
              :key="consume"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </div>
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
          :disable="loading || orderLoading"
          :loading="loading || orderLoading"
          no-caps :label="$t('dialogs.accept.buttons.accept')" color="green" @click="confirmOrder();" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showOrderReportModal" persistent @hide="clearAction">
    <div
      class="shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="reportOrderAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="reportActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.completedMaterialOrderReport.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="reportActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ reportActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-select
            v-model="whichSort"
            filled
            map-options
            :options="[{ label: 'Sort-1', value: 1 }, { label: 'Sort-2', value: 2 }]"
            :label="$t('forms.completedMaterialOrderReport.fields.sort.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.completedMaterialOrderReport.fields.sort.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.completedOrderQuantity"
            :prefix="`${selectedData.quantity} ${ $t('from') }:`"
            :disable="!whichSort"
            filled
            type="number"
            :label="$t('forms.completedMaterialOrderReport.fields.quantity.label')"
            :rules="[ val => val && val > 0 || $t('forms.completedMaterialOrderReport.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.completedOrderRoll"
            :disable="!selectedData.completedOrderQuantity"
            filled
            type="number"
            :label="$t('forms.completedMaterialOrderReport.fields.roll.label')"
            :rules="[val => val !== false && val >= 0 || $t('forms.completedMaterialOrderReport.fields.roll.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.completedMaterialOrderReport.fields.consumedDtos.title') }}
        </div>
        <q-separator class="q-mb-md" />
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <selectable-list
            v-model="row.thread"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.thread.label')"
            :store="thread"
            fetch-method="fetchThreads"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.ripeMaterial.fields.color.validation.required')"
            class="col-12 col-md-6"
          />
          <q-input
            filled
            type="number"
            v-model="row.quantity"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
            :rules="[ val => val && val > 0 || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || orderLoading"
            :loading="loading || orderLoading"
            no-caps
            :label="$t('forms.completedMaterialOrderReport.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator />
      </q-form>
    </div>
  </q-dialog>
</template>
