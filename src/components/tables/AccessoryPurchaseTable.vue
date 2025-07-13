<script setup>
import { onMounted, ref } from "vue";
import { useAccessoryPurchase } from "stores/accessoryPurchase.js";
import { useBudget } from "stores/budget.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const showPayModal = ref(false);
const paymentLoading = ref(false);
const payActionErr = ref(null);
const selectedData = ref({});

function clearAction () {
  selectedData.value = {};
  payActionErr.value = null;
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
    description: 'payedForAccessoryDebt #' + selectedData.value.id,
    isIncome: false,
    accessoryPurchase: selectedData.value['@id']
  }

  useBudget().payDebt(input)
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.accessoryPurchase.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => paymentLoading.value = false)
}

const columns = [
  { name: 'id', label: t('tables.accessoryPurchase.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.accessoryPurchase.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'purchasedBy', label: t('tables.accessoryPurchase.columns.purchasedBy'), align: 'left', field: 'purchasedBy' },
  { name: 'accessory', label: t('tables.accessoryPurchase.columns.accessory'), align: 'left', field: 'accessory' },
  { name: 'quantity', label: t('tables.accessoryPurchase.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.accessoryPurchase.columns.price'), align: 'left', field: 'price' },
  { name: 'totalPrice', label: t('tables.accessoryPurchase.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'paidPrice', label: t('tables.accessoryPurchase.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'transaction', label: t('tables.accessoryPurchase.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useAccessoryPurchase();
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

  repository.fetchPurchases({...pagination.value, ...filters.value})
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
    :no-data-label="$t('tables.accessoryPurchase.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.accessoryPurchase.header.title') }}</div>

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
          <div v-if="col.name === 'purchasedBy'">
            {{ props.row.purchasedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'accessory'">
            {{ props.row.accessory.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ formatFloatToInteger(props.row.quantity) }} ({{ $t(props.row.accessory.measurement) }})
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'totalPrice'">
            {{ formatFloatToInteger(props.row.totalPrice) }} {{ props.row.budget.name }}
          </div>
          <div
            v-else-if="col.name === 'paidPrice'"
            :class="Number(props.row.totalPrice) > Number(props.row.paidPrice) ? 'text-red' : 'text-green'"
          >
            {{ formatFloatToInteger(props.row.paidPrice) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.accessoryPurchase.columns.transaction')"
            />
          </div>
          <div
            v-else-if="col.name === 'action' && !props.row.isPayed"
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
          <div class="text-h6"> {{ $t('dialogs.accessoryPurchase.barPayDebt') }} </div>
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
            :prefix="$t('debts') + ': ' + `${(selectedData.totalPrice - selectedData.paidPrice)}`"
            filled
            type="number"
            :label="$t('forms.accessoryPurchase.fields.debtQuantity.label')"
            :rules="[ val => val && val <= ((selectedData.price * selectedData.quantity) - selectedData.paidPrice) || $t('forms.accessoryPurchase.fields.debtQuantity.validation.required')]"
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
            :label="$t('forms.accessoryPurchase.buttons.receiveDebt')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<style scoped>
</style>
