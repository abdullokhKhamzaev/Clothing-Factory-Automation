<script setup>
import { computed, onMounted, ref } from "vue";
import { useThreadPurchase } from "stores/threadPurchase.js";
import { useBudget } from "stores/budget.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import SkeletonTable from "components/tables/SkeletonTable.vue";

const emit = defineEmits(['submit']);
let props = defineProps({
  threads: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
});

const $q = useQuasar();
const { t } = useI18n();

const selectedData = ref({});
const showPurchaseModal = ref(false);
const createActionErr = ref(null);

const budget = useBudget();
const budgets = ref([]);
const budgetLoading = ref(false);
function getBudgets() {
  budgetLoading.value = true;
  budget.fetchBudgets('')
    .then((res) => {
      budgets.value = res.data['hydra:member'];
    })
    .finally(() => {
      budgetLoading.value = false;
    });
}
const budgetOptions = computed(() => {
  let options = [];
  for (let i in budgets.value) {
    options.push({
      label: budgets.value[i].name,
      value: budgets.value[i]
    });
  }
  return options
})

const user = useAbout();

const columns = [
  { name: 'name', label: t('tables.thread.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.thread.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.thread.columns.price'), align: 'left', field: 'price' }
];
const pagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
})
function getThreads() {
  emit('submit', { page: pagination.value.page });
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
}
function createAction() {
  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  let input = {
    thread: selectedData.value.thread,
    quantity: selectedData.value.quantity,
    price: selectedData.value.price,
    totalPrice: String(selectedData.value.quantity * selectedData.value.price),
    budget: selectedData.value.budget['@id'],
    paidPrice: selectedData.value.paidPrice,
    purchasedBy: user.about['@id'],
    transaction: [{
      paidPrice: selectedData.value.paidPrice,
      createdBy: user.about['@id'],
      isIncome: false,
      description: 'Ip sotib olish',
      budget: selectedData.value.budget['@id'],
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
      getThreads();
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
}

const threadOptions = computed(() => {
  let options = [];
  for (let i in props.threads) {
    options.push({
      label: props.threads[i].name,
      value: props.threads[i]['@id']
    });
  }
  return options;
})
const pagesNumber = computed(() => Math.ceil(props.total / pagination.value.rowsPerPage))

onMounted(() => {
  getBudgets();
});
</script>

<template>
  <skeleton-table
    :loading="props.loading"
  />
  <q-table
    v-show="!loading"
    flat
    bordered
    :rows="props.threads"
    :columns="columns"
    :no-data-label="$t('tables.thread.header.empty')"
    color="primary"
    row-key="id"
    :pagination="pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-md-center justify-between">
        <div class="q-table__title">{{ $t('tables.thread.header.title') }}</div>
        <q-btn no-caps :label="$t('tables.thread.buttons.add')" color="primary" @click="showPurchaseModal = true" />
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
              <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
            </div>

            <div v-if="col.name === 'price'">
              <span> {{ props.row.price * props.row.quantity }} </span>
            </div>
          </q-td>
        </q-tr>
      </template>
  </q-table>

  <div
    v-if="total > pagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="loading"
      v-model="pagination.page"
      input-class="text-bold text-black"
      :max="pagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getThreads"
    />
  </div>

  <!-- Dialogs -->
  <q-dialog v-model="showPurchaseModal" persistent>
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
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction"/>
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
          <q-select
            v-model="selectedData.thread"
            filled
            emit-value
            map-options
            :options="threadOptions"
            :label="$t('forms.threadPurchase.fields.thread.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.threadPurchase.fields.thread.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            v-model="selectedData.budget"
            filled
            emit-value
            map-options
            :loading="budgetLoading"
            :options="budgetOptions"
            :label="$t('forms.threadPurchase.fields.budget.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.threadPurchase.fields.budget.validation.required')]"
            class="col-12"
            hide-bottom-space
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
            class="col-6"
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
            class="col-6"
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
          <q-btn no-caps :label="$t('forms.threadPurchase.buttons.buy')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
