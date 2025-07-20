<script setup>
import { onMounted, ref } from "vue";
import { useIndebtedness } from "stores/indebtednesses.js";
import { useBudget } from "stores/budget.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import {DATE_FORMAT, formatDate, formatFloatToInteger} from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";
import RefreshButton from "components/RefreshButton.vue";
import SelectableList from "components/selectableList.vue";

const { t } = useI18n();
const $q = useQuasar();
const budget = useBudget();
const showPayModal = ref(false);
const paymentLoading = ref(false);
const payActionErr = ref(null);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);

function clearAction () {
  selectedData.value = {};
  payActionErr.value = null;
  createActionErr.value = null;
}
function payAction () {
  if (paymentLoading.value) return; // Prevent multiple rapid calls
  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  paymentLoading.value = true;

  const input = {
    budget: selectedData.value.budget['@id'],
    quantity: selectedData.value.debtQuantity,
    description: 'payedForIndebtedness -> ' + selectedData.value.name,
    isIncome: false,
    indebtedness: selectedData.value['@id']
  }

  useBudget().payDebt(input)
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.indebtedness.confirmation.successCreated')
      })
      clearAction();
      refresh();
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => paymentLoading.value = false)
}

const columns = [
  { name: 'id', label: t('tables.indebtedness.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.indebtedness.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'dealDate', label: t('tables.indebtedness.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'name', label: t('tables.indebtedness.columns.name'), align: 'left', field: 'name' },
  { name: 'description', label: t('tables.indebtedness.columns.description'), align: 'left', field: 'description' },
  { name: 'quantity', label: t('tables.indebtedness.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'remainingAmount', label: t('tables.indebtedness.columns.remainingAmount'), align: 'left', field: 'remainingAmount' },
  { name: 'transaction', label: t('tables.indebtedness.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useIndebtedness();
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

function createAction () {
  if (loading.value) return; // Prevent multiple rapid calls

  loading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  repository.create(selectedData.value)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.indebtedness.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.indebtedness.confirmation.failure')
      })
    })
    .finally(() => {
      loading.value = false;
      refresh();
    });
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.indebtedness.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.indebtedness.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.indebtedness.buttons.add')"
            no-caps
            @click="showCreateModal = true"
          />
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
          <div v-else-if="col.name === 'dealDate'">
            {{ formatDate(props.row.dealDate) }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ formatFloatToInteger(props.row.quantity) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'remainingAmount'">
            {{ formatFloatToInteger(props.row.remainingAmount) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.indebtedness.columns.transaction')"
            />
          </div>
          <div
            v-else-if="col.name === 'action' && Number(props?.row?.remainingAmount)"
            class="flex justify-end"
          >
            <q-btn
              class="q-px-sm"
              outline
              dense
              no-caps
              no-wrap
              :label="$t('pay')"
              text-color="green"
              icon="mdi-cash"
              @click="showPayModal = true; selectedData = {...props.row}"
            />
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <transaction-list :lists="props.row.transaction" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showCreateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.indebtedness.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="createActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ createActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.indebtedness.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.indebtedness.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.description"
            type="textarea"
            :label="$t('forms.indebtedness.fields.description.label')"
            filled
            required
            class="col-12"
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.indebtedness.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.indebtedness.fields.budget.validation.required')"
            class="col-12"
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.indebtedness.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.indebtedness.fields.quantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.dealDate"
            mask="####-##-##"
            :label="$t('forms.indebtedness.fields.dealDate.label')"
            :rules="[val => val && val.length >= 10 || $t('forms.indebtedness.fields.dealDate.validation.required')]"
            class="col-12"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="selectedData.dealDate"
                    :mask="DATE_FORMAT"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading"
            :loading="loading"
            no-caps
            :label="$t('forms.indebtedness.buttons.borrow')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showPayModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="payAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="payActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.indebtedness.barPayDebt') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="payActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ payActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            v-model.number="selectedData.debtQuantity"
            :prefix="$t('debts') + ': ' + `${(Number(selectedData.remainingAmount))}`"
            filled
            type="number"
            :label="$t('forms.threadPurchase.fields.debtQuantity.label')"
            :rules="[
              val => (val !== null && val !== undefined && val >= 0 && val <= Number(selectedData.remainingAmount)) || $t('forms.threadPurchase.fields.debtQuantity.validation.required')
            ]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || paymentLoading"
            :loading="loading || paymentLoading"
            no-caps
            :label="$t('forms.indebtedness.buttons.payIndebtedness')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
