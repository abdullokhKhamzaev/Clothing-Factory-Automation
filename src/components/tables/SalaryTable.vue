<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar, exportFile } from "quasar";
import { useSalary } from "stores/salary.js";
import { formatDate, formatFloatToInteger } from "../../libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SalaryPaymentsList from "components/SalaryPaymentsList.vue";

// Props
let props = defineProps({
  salaries: {
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

const $q = useQuasar();
const { t } = useI18n();
const emit = defineEmits(['submit']);

// Dialogs
const selectedData = ref({});
const showSalaryModal = ref(false);
const showAdvanceModal = ref(false);
const salaryActionErr = ref(false);
const advanceActionErr = ref(false);
const salaryLoading = ref(false);

// table settings
const visibleColumns = ref([ 'worker', 'month', 'baseSalary', 'dailyWage', 'workedDays', 'pieceworkEarning', 'advancePayment', 'paidAmount', 'budget', 'isPaid', 'transaction' ]);
const columns = [
  { name: 'worker', label: t('tables.users.columns.worker'), align: 'left', field: 'worker', required: true },
  { name: 'month', label: t('tables.users.columns.month'), align: 'left', field: 'month' },
  { name: 'baseSalary', label: t('tables.users.columns.baseSalary'), align: 'left', field: 'baseSalary' },
  { name: 'dailyWage', label: t('tables.users.columns.dailyWage'), align: 'left', field: 'dailyWage' },
  { name: 'workedDays', label: t('tables.users.columns.workedDays'), align: 'left', field: 'workedDays' },
  { name: 'pieceworkEarning', label: t('tables.users.columns.pieceworkEarning'), align: 'left', field: 'pieceworkEarning' },
  { name: 'advancePayment', label: t('tables.users.columns.advancePayment'), align: 'left', field: 'advancePayment' },
  { name: 'paidAmount', label: t('tables.users.columns.paidAmount'), align: 'left', field: 'paidAmount' },
  { name: 'transaction', label: t('tables.users.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'right', field: 'action', required: true }
];

// functions
function getSalaries() {
  emit('submit');
}
function clearAction() {
  selectedData.value = {};
  salaryActionErr.value = false;
  advanceActionErr.value = false;
}
function paySalaryAction () {
  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  salaryLoading.value = true;

  const input = {
    paidAmount: selectedData.value.quantity,
    isPaid: false
  }

  useSalary().paySalary(selectedData.value.id, input)
    .then(() => {
      showSalaryModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.successPayed')
      })
      clearAction();
      getSalaries();
    })
    .catch((res) => {
      salaryActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.failure')
      })
    })
    .finally(() => salaryLoading.value = false)
}
function payAdvanceAction () {
  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  salaryLoading.value = true;

  const input = {
    advancePayment: selectedData.value.quantity,
  }

  useSalary().payAdvance(selectedData.value.id, input)
    .then(() => {
      showAdvanceModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.successPayed')
      })
      clearAction();
      getSalaries();
    })
    .catch((res) => {
      advanceActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.failure')
      })
    })
    .finally(() => salaryLoading.value = false)
}
function wrapCsvValue(val, formatFn, row) {
  // If the value is undefined or null, return an empty string
  if (val === undefined || val === null) {
    return '""';
  }

  let formatted = formatFn ? formatFn(val, row) : val;

  // If the formatted value is still undefined or null, return an empty string
  if (formatted === undefined || formatted === null) {
    formatted = '';
  }

  // Escape quotes by doubling them.
  formatted = formatted.replace(/"/g, '""');

  // Handle new lines (optional).
  formatted = formatted.replace(/\r?\n/g, ' '); // Replaces newlines with a space.

  return `"${formatted}"`;
}
function exportTable(users) {
  const content = [
    // Create header row (column labels)
    columns.map(col => wrapCsvValue(col.label)).join(','),

    // Create data rows
    users.map(row =>
      columns.map(col => {
        // Access nested data like salaryCurrency.name or roles
        let value = typeof col.field === 'function'
          ? col.field(row)
          : row[col.field ?? col.name];

        // Handle nested fields like salaryCurrency
        if (col.name === 'salaryCurrency') {
          value = row.salaryCurrency ? row.salaryCurrency.name : '';
        } else if (col.name === 'roles') {
          value = row.roles ? row.roles.join(', ') : ''; // Joining roles into a comma-separated string
        }

        return wrapCsvValue(value, col.format, row);
      }).join(',')
    )
  ].join('\r\n'); // Use carriage return and newline to separate rows

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  );

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    });
  }
}
</script>

<template>
  <skeleton-table
    :loading="props.loading || salaryLoading"
  />
  <q-table
    v-show="!loading && !salaryLoading"
    flat
    bordered
    :rows="props.salaries"
    :columns="columns"
    :no-data-label="$t('tables.users.header.empty')"
    :loading="props.loading || salaryLoading"
    :visible-columns="visibleColumns"
    color="primary"
    :pagination="props.pagination"
    hide-pagination
  >
    <template v-slot:top>
      <div class="col-12 flex">
        <q-select
          style="min-width: 100px;"
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
          :class="$q.screen.lt.sm ? 'full-width q-mb-md' : 'q-ml-auto q-mr-sm'"
        />
        <div
          :class="$q.screen.lt.sm ? 'flex full-width justify-between': 'flex'"
        >
          <q-btn
            color="primary"
            icon-right="outbox"
            no-caps
            outline
            @click="exportTable(users)"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td
          auto-width
          v-for="col in columns"
          :key="col.name"
          :props="props"
        >
          <div v-if="col.name === 'worker'">
            {{ props.row.worker.fullName }}
          </div>
          <div v-else-if="col.name === 'month'">
            {{ formatDate(props.row.month).slice(0, 10) }}
          </div>
          <div v-else-if="col.name === 'baseSalary'">
            {{ formatFloatToInteger(props.row.baseSalary) === '0' ? '-' : formatFloatToInteger(props.row.baseSalary) + ' ' + props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'dailyWage'">
            {{ formatFloatToInteger(props.row.dailyWage) === '0' ? '-' : formatFloatToInteger(props.row.dailyWage) + ' ' + props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'pieceworkEarning'">
            {{ formatFloatToInteger(props.row.pieceworkEarning) === '0' ? '-' : formatFloatToInteger(props.row.pieceworkEarning) + ' ' + props.row.budget.name}}
          </div>
          <div v-else-if="col.name === 'advancePayment'">
            {{ formatFloatToInteger(props.row.advancePayment) === '0' ? '-' : formatFloatToInteger(props.row.advancePayment) + ' ' + props.row.budget.name}}
          </div>
          <div v-else-if="col.name === 'paidAmount'">
            {{ formatFloatToInteger(props.row.paidAmount) === '0' ? '-' : formatFloatToInteger(props.row.paidAmount) + ' ' + props.row.budget.name}}
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-if="props.row?.transaction.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.users.columns.transaction')"
            />
          </div>

          <div v-else-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                v-if="!Number(props.row.paidAmount)"
                dense
                outline
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-cash"
                :label="$t('paySalary')"
                @click="selectedData = {...props.row}; showSalaryModal = true;"
              />
              <q-btn
                v-if="!Number(props.row.advancePayment)"
                dense
                outline
                no-caps
                no-wrap
                color="primary"
                icon-right="mdi-cash"
                :label="$t('payAdvance')"
                @click="selectedData = {...props.row}; showAdvanceModal = true;"
              />
            </div>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <salary-payments-list :lists="props.row.transaction" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showSalaryModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="paySalaryAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="salaryActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.salary.bar') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
        </div>
        <div v-if="salaryActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ salaryActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            :prefix="selectedData.budget.name"
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.salary.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.salary.fields.quantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || salaryLoading"
            :loading="props.loading || salaryLoading"
            no-caps
            :label="$t('forms.salary.buttons.pay')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showAdvanceModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="payAdvanceAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="advanceActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.advance.bar') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
        </div>
        <div v-if="advanceActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ advanceActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            :prefix="selectedData.budget.name"
            filled
            v-model="selectedData.quantity"
            :label="$t('forms.advance.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.advance.fields.quantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || salaryLoading"
            :loading="props.loading || salaryLoading"
            no-caps
            :label="$t('forms.advance.buttons.pay')"
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
