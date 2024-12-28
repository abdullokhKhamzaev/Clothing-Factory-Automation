<script setup>
import { ref } from "vue";
import { useQuasar, exportFile } from "quasar";

const $q = useQuasar();
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
const visibleColumns = ref([ 'name', 'surName', 'phone' ]);
const columns = [
  { name: 'name', label: 'Ism', align: 'left', field: 'name', sortable: false, required: true },
  { name: 'surName', label: 'Familya', align: 'left', field: 'surName' },
  { name: 'phone', label: 'Telefon', align: 'left', field: 'phone' }
];
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
    no-data-label="tables.users.header.empty"
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
            outlined
            v-model="searchTitle"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            label="Qidirish uchun yozing..."
            name="Name"
            clearable
            @update:model-value="triggerSubmit"
            :debounce="1000"
            dense
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-select
            v-model="visibleColumns"
            multiple
            outlined
            dense
            options-dense
            :display-value="$q.lang.table.columns"
            emit-value
            map-options
            :options="columns"
            option-value="name"
            label="Ustunlar"
            options-cover
            style="min-width: 100px;"
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

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
        <q-td auto-width>
          <div class="flex no-wrap justify-end q-gutter-x-sm">
            <q-btn size="md" color="primary" rounded dense icon='edit' @click="showUpdateModal = true; selectedData = props.row">
              <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                O'zgartirish
              </q-tooltip>
            </q-btn>
            <q-btn size="md" color="red" rounded dense icon='delete' @click="showDeleteModal = true; selectedData = props.row">
              <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                O'chirish
              </q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <!-- Dialogs -->
  <q-dialog v-model="showDeleteModal" persistent>
    <q-card>
      <q-card-section class="row flex items-center q-pb-none">
        <div class="text-h6">Confirm Deletion</div>
        <q-space />
        <q-icon name="delete" color="grey" size="sm" />
      </q-card-section>

      <q-card-section>
        Are you sure you want to delete this item? This action cannot be undone.
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn label="Cancel" color="primary" v-close-popup @click="clearAction" />
        <q-btn label="Confirm" color="red" @click="deleteAction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showUpdateModal" persistent>
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">O'zgartirish</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
      </q-card-section>

      <q-card-section>
        <q-form
          @submit.prevent="updateAction"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="selectedData.name"
            label="Ism *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos ismni kiriting']"
          />
          <q-input
            filled
            v-model="selectedData.surName"
            label="Familya *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos familyani kiriting']"
          />
          <q-input
            filled
            v-model="selectedData.phone"
            label="Telefon *"
            name="First Name"
            mask="+############"
            :rules="[ val => val && val.length > 0 || 'Iltimos telefon raqamni kiriting']"
          />
          <div>
            <q-btn label="O'zgartirish" type="submit" color="primary"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showCreateModal" persistent>
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Qo'shish</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form
          @submit.prevent="createAction"
          @reset="clearAction"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="selectedData.name"
            label="Ism *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos ismni kiriting']"
          />
          <q-input
            filled
            v-model="selectedData.surName"
            label="Familya *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos familyani kiriting']"
          />
          <q-input
            filled
            v-model="selectedData.phone"
            label="Telefon *"
            name="First Name"
            mask="+############"
            :rules="[ val => val && val.length > 0 || 'Iltimos telefon raqamni kiriting']"
          />

          <div>
            <q-btn label="Qo'shish" type="submit" color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
