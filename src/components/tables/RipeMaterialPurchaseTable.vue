<script setup>
import { onMounted, ref } from "vue";
import { useRipeMaterialPurchase } from "stores/ripeMaterialPurchase.js";
import { useBudget } from "stores/budget.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatDate, formatFloatToInteger, isToday } from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const paymentLoading = ref(false);
const showPayModal = ref(false);
const payActionErr = ref(null);
const selectedData = ref({});

const columns = [
  { name: 'id', label: t('tables.ripeMaterialPurchase.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.ripeMaterialPurchase.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'purchasedBy', label: t('tables.ripeMaterialPurchase.columns.purchasedBy'), align: 'left', field: 'purchasedBy' },
  { name: 'ripeMaterial', label: t('tables.ripeMaterialPurchase.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'quantity', label: t('tables.ripeMaterialPurchase.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'quantitySort2', label: t('tables.ripeMaterialPurchase.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'price', label: t('tables.ripeMaterialPurchase.columns.price'), align: 'left', field: 'price' },
  { name: 'priceSort2', label: t('tables.ripeMaterialPurchase.columns.priceSort2'), align: 'left', field: 'priceSort2' },
  { name: 'roll', label: t('tables.ripeMaterialPurchase.columns.roll'), align: 'left', field: 'roll' },
  { name: 'rollSort2', label: t('tables.ripeMaterialPurchase.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'totalPrice', label: t('tables.ripeMaterialPurchase.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'paidPrice', label: t('tables.ripeMaterialPurchase.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'transaction', label: t('tables.ripeMaterialPurchase.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useRipeMaterialPurchase();
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
    description: 'payedForMaterialPurchaseDebt #' + selectedData.value.id,
    isIncome: false,
    ripeMaterialPurchase: selectedData.value['@id']
  }

  useBudget().payDebt(input)
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successCreated')
      })
      clearAction();
      refresh();
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => paymentLoading.value = false)
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.ripeMaterialPurchase.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.ripeMaterialPurchase.header.title') }}</div>

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
          <div v-else-if="col.name === 'purchasedBy'">
            {{ props.row.purchasedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'ripeMaterial'">
            {{ props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ Number(props.row.quantity) > 0 ? `${formatFloatToInteger(props.row.quantity)} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'quantitySort2'">
            {{ Number(props.row.quantitySort2) > 0 ? `${props.row.quantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'priceSort2'">
            {{ formatFloatToInteger(props.row.priceSort2) }} {{ props.row.budget.name }}
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
              :label="$t('tables.ripeMaterialPurchase.columns.transaction')"
            />
          </div>
          <div
            v-else-if="col.name === 'action' && !props.row.isPayed"
            class="flex justify-end"
          >
            <q-btn
              class="q-px-sm"
              outline
              no-wrap
              dense
              no-caps
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
          <div class="text-h6"> {{ $t('dialogs.ripeMaterialPurchase.barPayDebt') }} </div>
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
            :label="$t('forms.threadPurchase.fields.debtQuantity.label')"
            :rules="[ val => val && val <= ((selectedData.price * selectedData.quantity) - selectedData.paidPrice) || $t('forms.threadPurchase.fields.debtQuantity.validation.required')]"
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
            :label="$t('forms.threadPurchase.buttons.payDebt')"
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
