<script setup>
import { ref } from "vue";
import { useQuasar, exportFile } from "quasar";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const { t } = useI18n();
const emit = defineEmits(['submit']);

defineProps({
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
});

// Modals
const showDeleteModal = ref(false);
const showUpdateModal = ref(false);
const showCreateModal = ref(false);

const searchTitle = ref('');
const selectedData = ref({});

// table settings
const columns = [
  { name: 'name', label: t('tables.users.columns.name'), align: 'left', field: 'name' },
  { name: 'surName', label: t('forms.user.fields.surname.label'), align: 'left', field: 'surName' },
  { name: 'phone', label: t('tables.users.columns.phone'), align: 'left', field: 'phone' },
  { name: 'action', label: '', align: 'right', field: 'action', required: true }
];
const visibleColumns = ref(columns.map(column => column.name));

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
function exportTable(data) {
  const content = [
    // Create header row (column labels)
    columns.map(col => wrapCsvValue(col.label)).join(','),

    // Create data rows
    data.map(row =>
      columns.map(col => {
        // Access nested data like salaryCurrency.name or roles
        let value = typeof col.field === 'function'
          ? col.field(row)
          : row[col.field ?? col.name];

        // // Handle nested fields like salaryCurrency
        // if (col.name === 'salaryCurrency') {
        //   value = row.salaryCurrency ? row.salaryCurrency.name : '';
        // } else if (col.name === 'roles') {
        //   value = row.roles ? row.roles.join(', ') : ''; // Joining roles into a comma-separated string
        // }

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

function clearAction() {
  selectedData.value = {};
}
function triggerSubmit() {
  emit('submit');
}
function createAction() {
  showCreateModal.value = false;
  console.log('create action handled');
}
function updateAction() {
  showUpdateModal.value = false;
  console.log('update action handled');
  clearAction();
}
function deleteAction() {
  showDeleteModal.value = false;
  console.log('delete action handled');
}
</script>

<template>
  <q-table
    flat
    bordered
    :rows="data"
    :columns="columns"
    :no-data-label="$t('tables.users.header.empty')"
    title="Data"
    color="primary"
    row-key="id"
    :visible-columns="visibleColumns"
    @request="triggerSubmit"
  >
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>
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
            @update:model-value="triggerSubmit"
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
              :class="$q.screen.lt.sm ? '' : 'q-mr-sm'"
              color="primary"
              icon-right="outbox"
              no-caps
              outline
              @click="exportTable(data)"
            />
            <q-btn
              color="primary"
              icon-right="add"
              label="Qo'shish"
              no-caps
              @click="showCreateModal = true"
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
          <div v-if="col.name === 'name'">
            {{ props.row.name }}
          </div>

          <div v-else-if="col.name === 'action'">
            <div class="flex no-wrap justify-end q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon='edit' @click="selectedData = {...props.row}; showUpdateModal = true;">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon='delete' @click="selectedData = {...props.row}; showDeleteModal = true;">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('delete') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
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
        <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
          <div class="text-h6"> {{ $t('dialogs.user.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.user.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.name.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.surName"
            :label="$t('forms.user.fields.surname.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.surname.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.phone"
            :label="$t('forms.user.fields.phone.label')"
            name="First Name"
            mask="+#################"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.phone.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.user.buttons.create')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showUpdateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateAction">
        <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
          <div class="text-h6"> {{ $t('dialogs.user.barEdit') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.user.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.name.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.surName"
            :label="$t('forms.user.fields.surname.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.surname.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.phone"
            :label="$t('forms.user.fields.phone.label')"
            name="First Name"
            mask="+#################"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.phone.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.user.buttons.edit')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showDeleteModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row flex items-center q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.delete.bar') }}</div>
        <q-space />
        <q-icon name="delete" color="grey" size="sm" />
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.delete.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn :label="$t('dialogs.delete.buttons.cancel')" color="primary" v-close-popup />
        <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteAction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
