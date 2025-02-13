<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar, exportFile } from "quasar";
import { useAttendance } from "stores/attendance.js";
import { useAbout } from "stores/user/about.js";
import { formatDate, formatFloatToInteger } from "../../libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
let props = defineProps({
  users: {
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

const user = useAbout();

// Dialogs
const searchTitle = ref('');
const selectedData = ref({});
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
const userLoading = ref(false);

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
function getUsers() {
  emit('submit', { fullName: searchTitle.value });
}
function clearAction() {
  selectedData.value = {};
}
function acceptAction (isWork) {
  if (!selectedData.value.id && !user.about['@id']) {
    console.warn('empty data');
    return;
  }

  userLoading.value = true;

  const input = {
    worker: selectedData.value['@id'],
    date: new Date(),
    checkedBy: user.about['@id'],
  }

  input.isWork = isWork;

  useAttendance().accept(input)
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
      getUsers();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => userLoading.value = false)
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
    :loading="props.loading || userLoading"
  />
  <q-table
    v-show="!loading && !userLoading"
    flat
    bordered
    :rows="props.users"
    :columns="columns"
    :no-data-label="$t('tables.users.header.empty')"
    :loading="props.loading || userLoading"
    :visible-columns="visibleColumns"
    color="primary"
    :pagination="props.pagination"
    hide-pagination
  >
    <template v-slot:top>
      <div class="col-12 flex">
        <q-input
          style="min-width: 225px"
          dense
          outlined
          clearable
          v-model="searchTitle"
          :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
          :label="$t('tables.users.header.searchTitle')"
          :debounce="1000"
          @update:model-value="emit('submit', { fullName: searchTitle });"
        >
          <template v-slot:append>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
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
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-check"
                @click="selectedData = {...props.row}; showAcceptModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('accept') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                dense
                no-caps
                no-wrap
                size="md"
                color="red"
                icon-right="mdi-cancel"
                @click="selectedData = {...props.row}; showRejectModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('reject') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <pre>
            {{ props.row.transaction }}
          </pre>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showAcceptModal" persistent>
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.accept.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.accept.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup @click="clearAction()" />
        <q-btn
          :disable="loading || userLoading"
          :loading="loading || userLoading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction(true);"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRejectModal" persistent>
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.reject.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.reject.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.reject.buttons.cancel')" color="grey" v-close-popup @click="clearAction()" />
        <q-btn
          :disable="loading || userLoading"
          :loading="loading || userLoading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="acceptAction(false);"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped>
</style>
