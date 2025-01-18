<script setup>
import { computed, onMounted, ref } from "vue";
import { useBudget } from "stores/budget.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
let props = defineProps({
  purchases: {
    type: Array,
    required: true
  },
  pagination: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
});
const emit = defineEmits(['refresh']);

const { t } = useI18n();
const $q = useQuasar();
const showPayModal = ref(false);
const payActionErr = ref(null);
const selectedData = ref({});
const budgets = ref([]);
const budgetLoading = ref(false);

function getBudgets () {
  budgetLoading.value = true;
  useBudget().fetchBudgets('')
    .then((res) => {
      budgets.value = res.data['hydra:member'];
    })
    .finally(() => {
      budgetLoading.value = false;
    });
}
function clearAction () {
  selectedData.value = {};
  payActionErr.value = null;
}
function payAction () {
  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  const input = {
    budget: selectedBudget.value[0]['@id'],
    quantity: selectedData.value.debtQuantity,
    description: `Bo'yoq savdo #${selectedData.value.id} Qarz to'landi`,
    isIncome: false,
    ripeMaterialOrderAccepted: selectedData.value['@id']
  }

  useBudget().payDebt(input)
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.paintPurchase.confirmation.successCreated')
      })
      clearAction();
      emit('refresh');
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
}

const columns = [
  { name: 'id', label: t('tables.paintPurchase.columns.id'), align: 'left', field: 'id' },
  { name: 'receivedAt', label: t('tables.paintPurchase.columns.receivedAt'), align: 'left', field: 'receivedAt' },
  { name: 'receivedBy', label: t('tables.paintPurchase.columns.receivedBy'), align: 'left', field: 'receivedBy' },
  { name: 'ripeMaterial', label: t('tables.paintPurchase.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'receivedQuantitySort1', label: t('tables.paintPurchase.columns.receivedQuantitySort1'), align: 'left', field: 'receivedQuantitySort1' },
  { name: 'receivedQuantitySort2', label: t('tables.paintPurchase.columns.receivedQuantitySort2'), align: 'left', field: 'receivedQuantitySort2' },
  { name: 'receivedRollSort1', label: t('tables.paintPurchase.columns.receivedRollSort1'), align: 'left', field: 'receivedRollSort1' },
  { name: 'receivedRollSort2', label: t('tables.paintPurchase.columns.receivedRollSort2'), align: 'left', field: 'receivedRollSort2' },
  { name: 'servicePrice', label: t('tables.paintPurchase.columns.servicePrice'), align: 'left', field: 'servicePrice' },
  { name: 'payedPrice', label: t('tables.paintPurchase.columns.payedPrice'), align: 'left', field: 'payedPrice' },
  { name: 'transaction', label: t('tables.paintPurchase.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];

const selectedBudget = computed(() => {
  return budgets.value.filter((budget) => budget.currency['@id'] === selectedData?.value?.budget.currency);
})

onMounted(() => {
  getBudgets();
})
</script>

<template>
  <skeleton-table
    :loading="loading"
  />
  <q-table
    v-show="!props.loading"
    flat
    bordered
    :rows="props.purchases"
    :columns="columns"
    :no-data-label="$t('tables.paintPurchase.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.paintPurchase.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'receivedBy'">
            {{ props.row.receivedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'receivedQuantitySort1'">
            {{ Number(props.row.receivedQuantitySort1) > 0 ? `${formatFloatToInteger(props.row.receivedQuantitySort1)} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'receivedQuantitySort2'">
            {{ Number(props.row.receivedQuantitySort2) > 0 ? `${formatFloatToInteger(props.row.receivedQuantitySort2)} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'ripeMaterial'">
            {{ props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'servicePrice'">
            {{ formatFloatToInteger(props.row.servicePrice) }} {{ props.row.budget.name }}
          </div>
          <div
            v-else-if="col.name === 'payedPrice'"
            :class="Number(props.row.servicePrice) > Number(props.row.payedPrice) ? 'text-red' : 'text-green'"
          >
            {{ formatFloatToInteger(props.row.payedPrice) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.paintPurchase.columns.transaction')"
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
  <q-dialog v-model="showPayModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="payAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="payActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.paintPurchase.barPayDebt') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
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
            :prefix="$t('debts') + ': ' + `${(selectedData.servicePrice - selectedData.payedPrice)}`"
            filled
            type="number"
            :label="$t('forms.threadPurchase.fields.debtQuantity.label')"
            :rules="[ val => val && val <= (selectedData.servicePrice - selectedData.payedPrice) || $t('forms.threadPurchase.fields.debtQuantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.threadPurchase.buttons.payDebt')" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<style scoped>
</style>
