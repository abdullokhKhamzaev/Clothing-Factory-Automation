<script setup>
import { onMounted, ref } from "vue";
import { useThreadPurchase } from "stores/threadPurchase.js";
import { useThread } from "stores/thread.js";
import { useBudget } from "stores/budget.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();

const selectedData = ref({});
const showPurchaseModal = ref(false);
const purchaseLoading = ref(false);
const createActionErr = ref(null);

const budget = useBudget();
const user = useAbout();

const columns = [
  { name: 'name', label: t('tables.thread.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.thread.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.thread.columns.price'), align: 'left', field: 'price' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useThread();
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

  repository.fetchThreads({...pagination.value, ...filters.value})
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

function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
}
function createAction() {
  if (purchaseLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value.thread['@id']) {
    console.warn('user or thread not found');
    return
  }

  purchaseLoading.value = true;

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
      description: `threadPurchased ${selectedData.value.thread.name} - ${selectedData.value.quantity} ${selectedData.value.thread.measurement} x ${selectedData.value.price}`,
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
      refresh()
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
    .finally(() => purchaseLoading.value = false)
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.transaction.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.thread.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            no-caps
            :label="$t('tables.thread.buttons.add')"
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
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'name'">
            {{ props.row.name }}
          </div>

          <div v-if="col.name === 'quantity'">
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ $t(props.row.measurement) }}) </span>
          </div>

          <div v-if="col.name === 'price'">
            <span> {{ props.row.price * props.row.quantity }} {{ props.row.budget.name }} </span>
          </div>
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
            :store="repository"
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
</template>
