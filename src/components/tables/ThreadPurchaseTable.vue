<script setup>
import { onMounted, ref } from "vue";
import { useThreadPurchase } from 'src/stores/threadPurchase.js'
import { useThread } from "stores/thread.js";
import { useBudget } from "stores/budget.js";
import { useAbout } from "stores/user/about.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatDate, formatFloatToInteger, isToday } from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";
import RefreshButton from "components/RefreshButton.vue";
import SelectableList from "components/selectableList.vue";

const { t } = useI18n();
const $q = useQuasar();
const showPayModal = ref(false);
const paymentLoading = ref(false);
const payActionErr = ref(null);
const selectedData = ref({});
const showPurchaseModal = ref(false);
const createActionErr = ref(null);

const budget = useBudget();
const user = useAbout();
const thread = useThread();

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
    description: 'productCost.payedForThreadPurchaseDebt #' + selectedData.value.id,
    isIncome: false,
    threadPurchase: selectedData.value['@id']
  }

  useBudget().payDebt(input)
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.threadPurchase.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => {
      paymentLoading.value = false;
      refresh();
    })
}

const columns = [
  { name: 'id', label: t('tables.threadPurchase.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.threadPurchase.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'purchasedBy', label: t('tables.threadPurchase.columns.purchasedBy'), align: 'left', field: 'purchasedBy' },
  { name: 'thread', label: t('tables.threadPurchase.columns.thread'), align: 'left', field: 'thread' },
  { name: 'quantity', label: t('tables.threadPurchase.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.threadPurchase.columns.price'), align: 'left', field: 'price' },
  { name: 'totalPrice', label: t('tables.threadPurchase.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'paidPrice', label: t('tables.threadPurchase.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'transaction', label: t('tables.threadPurchase.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];
const visibleColumns = ref(columns.map(column => column.name));

function createAction() {
  if (loading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value.thread['@id']) {
    console.warn('user or thread not found');
    return
  }

  loading.value = true;

  let input = {
    thread: selectedData.value.thread['@id'],
    quantity: selectedData.value.quantity,
    price: selectedData.value.price,
    totalPrice: String(selectedData.value.quantity * selectedData.value.price),
    budget: selectedData.value.budget,
    paidPrice: selectedData.value.paidPrice,
    purchasedBy: user.about['@id'],
    transaction: [{
      paidPrice: selectedData.value.paidPrice,
      createdBy: user.about['@id'],
      isIncome: false,
      description: `productCost.threadPurchased ${selectedData.value.thread.name} - ${selectedData.value.quantity} ${selectedData.value.thread.measurement} x ${selectedData.value.price}`,
      budget: selectedData.value.budget,
      isOldInAndOut: false,
      price: String(selectedData.value.quantity * selectedData.value.price)
    }]
  }

  input.isPayed = Number(selectedData.value.paidPrice) === Number(selectedData.value.quantity * selectedData.value.price);

  useThreadPurchase().createPurchase(input)
    .then(() => {
      showPurchaseModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.threadPurchase.confirmation.successBought')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.threadPurchase.confirmation.failure')
      })
    })
    .finally(() => {
      loading.value = false;
      refresh();
    })
}

// Table Data
const repository = useThreadPurchase();
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
    :no-data-label="$t('tables.threadPurchase.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.threadPurchase.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            no-caps
            :label="$t('tables.thread.buttons.buy')"
            color="primary"
            class="q-mb-md q-mb-sm-none"
            @click="showPurchaseModal = true"
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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
          <div v-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'purchasedBy'">
            {{ props.row.purchasedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'thread'">
            {{ props.row.thread.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ formatFloatToInteger(props.row.quantity) }} {{ props.row.thread.measurement }}
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
              :label="$t('tables.threadPurchase.columns.transaction')"
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
  <q-dialog v-model="showPurchaseModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.threadPurchase.barCreate') }}</div>
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
          <selectable-list
            v-model="selectedData.thread"
            :label="$t('forms.threadPurchase.fields.thread.label')"
            :store="thread"
            fetch-method="fetchThreads"
            item-label="name"
            :rule-message="$t('forms.threadPurchase.fields.thread.validation.required')"
            class="col-12"
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.threadPurchase.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.threadPurchase.fields.budget.validation.required')"
            class="col-12"
          />
          <q-input
            v-model="selectedData.quantity"
            type="number"
            filled
            :disable="!selectedData.thread"
            :label="$t('forms.threadPurchase.fields.quantity.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.threadPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.price"
            type="number"
            filled
            :disable="!selectedData.budget || !selectedData.thread || !selectedData.quantity > 0"
            :prefix="selectedData?.budget === '/api/budgets/1' ? 'so\'m:' : '$:'"
            :label="$t('forms.threadPurchase.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.threadPurchase.fields.price.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.paidPrice"
            type="number"
            filled
            :disable="!selectedData.price || !selectedData.budget || !selectedData.thread || !selectedData.quantity > 0"
            :prefix="selectedData?.budget === '/api/budgets/1' ? `${selectedData.quantity * selectedData.price} so'm ${$t('from')}` : `${selectedData.quantity * selectedData.price} $ ${$t('from')}`"
            :label="$t('forms.threadPurchase.fields.paidPrice.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 && val <= Number(selectedData.quantity * selectedData.price) || $t('forms.threadPurchase.fields.paidPrice.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="purchaseLoading"
            :loading="purchaseLoading"
            no-caps
            :label="$t('forms.threadPurchase.buttons.buy')"
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
          <div class="text-h6"> {{ $t('dialogs.threadPurchase.barPayDebt') }} </div>
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
