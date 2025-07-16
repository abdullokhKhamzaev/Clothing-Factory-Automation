<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useSalary } from "stores/salary.js";
import { formatDate, formatFloatToInteger } from "../../libraries/constants/defaults.js";
import SalaryPaymentsList from "components/SalaryPaymentsList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();

// Dialogs
const selectedData = ref({});
const showSalaryModal = ref(false);
const showAdvanceModal = ref(false);
const salaryActionErr = ref(false);
const advanceActionErr = ref(false);
const salaryLoading = ref(false);

// table settings
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
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useSalary();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  month: new Date().toISOString().split('T')[0].slice(0, 7),
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchSalaries({...pagination.value, ...filters.value})
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

// functions
function clearAction() {
  selectedData.value = {};
  salaryActionErr.value = false;
  advanceActionErr.value = false;
}
function paySalaryAction () {
  if (salaryLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  salaryLoading.value = true;

  const input = {
    paidAmount: selectedData.value.quantity,
    isPaid: false
  }

  repository.paySalary(selectedData.value.id, input)
    .then(() => {
      showSalaryModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.successPayed')
      })
      clearAction();
      refresh();
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
  if (salaryLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  salaryLoading.value = true;

  const input = {
    advancePayment: selectedData.value.quantity,
  }

  repository.payAdvance(selectedData.value.id, input)
    .then(() => {
      showAdvanceModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.successPayed')
      })
      clearAction();
      refresh();
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
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.users.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.users.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-input
            filled
            v-model="filters.month"
            dense
            outlined
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            mask="####-##"
            :debounce="1000"
            @update:model-value="getItems"
            class="q-mb-md q-mb-sm-none"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="filters.month"
                    mask="YYYY-MM"
                    @update:model-value="getItems"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
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
            {{ props.row.transaction.reduce((sum, t) => sum + parseFloat(t.price), 0) }} {{ props.row.budget.name }}
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
                dense
                outline
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-cash"
                :label="$t('paySalary')"
                @click="selectedData = {...props.row}; showSalaryModal = true;"
              />
<!--              <q-btn-->
<!--                v-if="!Number(props.row.advancePayment)"-->
<!--                dense-->
<!--                outline-->
<!--                no-caps-->
<!--                no-wrap-->
<!--                color="primary"-->
<!--                icon-right="mdi-cash"-->
<!--                :label="$t('payAdvance')"-->
<!--                @click="selectedData = {...props.row}; showAdvanceModal = true;"-->
<!--              />-->
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
  <q-dialog v-model="showSalaryModal" persistent @hide="clearAction">
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
          <q-btn icon="close" flat round dense v-close-popup />
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
            :disable="loading || salaryLoading"
            :loading="loading || salaryLoading"
            no-caps
            :label="$t('forms.salary.buttons.pay')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showAdvanceModal" persistent @hide="clearAction">
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
          <q-btn icon="close" flat round dense v-close-popup />
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
            :disable="loading || salaryLoading"
            :loading="loading || salaryLoading"
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
