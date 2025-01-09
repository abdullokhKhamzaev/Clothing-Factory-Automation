<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar, exportFile } from "quasar";
import { useUser } from "stores/user/user.js";
import { useCurrency } from "stores/currency.js";
import { ROLES } from 'src/libraries/constants/defaults';
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
let props = defineProps({
  users: {
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
const emit = defineEmits(['submit']);
const user = useUser();

const currency = useCurrency();
const currencies = ref([]);

// Dialogs
const showCreateModal = ref(false);
const showUpdateModal = ref(false);
const showDeleteModal = ref(false);
const createActionErr = ref(null);
const updateActionErr = ref(null);

const isPwd = ref(false);
const searchTitle = ref('');
const selectedData = ref({});

const userLoading = ref(false);
const currencyLoading = ref(false);

// table settings
const visibleColumns = ref([ 'name', 'fullName', 'phone', 'salary', 'salaryCurrency', 'roles' ]);
const columns = [
  { name: 'fullName', label: t('tables.users.columns.fullName'), align: 'left', field: 'fullName', required: true },
  { name: 'phone', label: t('tables.users.columns.phone'), align: 'left', field: 'phone' },
  { name: 'salary', label: t('tables.users.columns.salary'), field: 'salary', sortable: true },
  { name: 'salaryCurrency', label: t('tables.users.columns.currency'), align: 'left', field: 'salaryCurrency' },
  { name: 'roles', label: t('tables.users.columns.role'), align: 'left', field: 'roles', sortable: true },
  { name: 'action', label: '', align: 'right', field: 'action', required: true }
];
const pagination = ref({
    rowsPerPage: 10,
    page: 1,
    descending: true,
    rowsNumber: 0
})

// computed
const pagesNumber = computed(() => Math.ceil(props.total / pagination.value.rowsPerPage))
const currencyOptions = computed(() => {
  let options = [];
  for ( let i in currencies.value ) {
    options.push( {
      label: `${currencies.value[i].symbol} - ${currencies.value[i].name} (${currencies.value[i].shortName})`,
      value: currencies.value[i]['@id']
    } );
  }
  return options
})

// functions
function getUsers() {
  emit('submit', { fullName: searchTitle.value, page: pagination.value.page });
}
function getCurrencies () {
  currencyLoading.value = true;
  currency.fetchCurrencies('?page=1')
    .then((res) => {
      currencies.value = res.data['hydra:member'];
    })
    .finally(() => {
      currencyLoading.value = false;
    });
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  updateActionErr.value = null;
}
function prefill() {
  if (selectedData.value?.salaryCurrency?.id) {
    selectedData.value.salaryCurrency = {
      label: `${selectedData.value.salaryCurrency.symbol} - ${selectedData.value.salaryCurrency.name} (${selectedData.value.salaryCurrency.shortName})`,
      value: selectedData.value.salaryCurrency['@id']
    }
  }
}
function createAction() {
  userLoading.value = true

  const input = {
    phone: selectedData.value.phone,
    password: selectedData.value.password,
    fullName: selectedData.value.fullName,
    salary: selectedData.value.salary,
    salaryCurrency: selectedData.value.salaryCurrency,
    roles: selectedData.value.roles,
  }

  user.createUser(input)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.user.confirmation.successCreated')
      })
      clearAction();
      getUsers();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.user.confirmation.failure')
      })
    })
    .finally(() => {
      userLoading.value = false;
    })
}
function updateAction() {
  if (selectedData?.value?.id) {
    const input = {
      phone: selectedData.value.phone,
      fullName: selectedData.value.fullName,
      salary: selectedData.value.salary,
      salaryCurrency: selectedData.value.salaryCurrency
    }

    userLoading.value = true;
    user.editUser(selectedData.value.id, input)
      .then(() => {
        clearAction();
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.user.confirmation.successEdited')
        });
        getUsers();
      })
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.user.confirmation.failure')
        })
      })
      .finally(() => userLoading.value = false);
  } else {
    console.warn('data is empty');
  }
}
function deleteAction() {
  if ( selectedData?.value?.id ) {
    user.deleteUser(selectedData.value.id)
      .then(() => {
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.user.confirmation.successDeleted')
        });
        clearAction();
        getUsers();
      })
  } else {
    console.warn('data is empty');
  }
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

onMounted(() => {
  getCurrencies();
})
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
    :pagination="pagination"
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
            @update:model-value="pagination.page = 1; emit('submit', { fullName: searchTitle, page: pagination.page });"
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
              @click="exportTable(users)"
            />
            <q-btn
              color="primary"
              icon-right="add"
              :label="$t('tables.users.buttons.add')"
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
          <div v-if="col.name === 'fullName'">
            {{ props.row.fullName }}
          </div>

          <div v-else-if="col.name === 'salaryCurrency'">
            {{ props.row?.salaryCurrency?.name || '-' }}
          </div>

          <div v-else-if="col.name === 'roles'">
            <span
              v-for="role in props.row.roles"
              :key="role"
              class="q-mr-sm"
            >
              {{ role }}
            </span>
          </div>

          <div v-else-if="col.name === 'action'">
            <div class="flex no-wrap justify-end q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon='edit' @click="selectedData = props.row; prefill(); showUpdateModal = true;">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon='delete' @click="selectedData = props.row; showDeleteModal = true;">
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

  <div
    v-if="total > pagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="loading || userLoading"
      v-model="pagination.page"
      input-class="text-bold text-black"
      :max="pagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getUsers"
    />
  </div>

  <!-- Dialogs -->
  <q-dialog v-model="showCreateModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.user.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
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
          <q-input
            filled
            v-model="selectedData.fullName"
            :label="$t('forms.user.fields.fullName.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.fullName.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.phone"
            :label="$t('forms.user.fields.phone.label')"
            name="First Name"
            mask="+############"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.phone.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            :type="isPwd ? 'password' : 'text'"
            filled
            v-model="selectedData.password"
            :label="$t('forms.user.fields.password.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.password.validation.required')]"
            hide-bottom-space
            class="col-12"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-select
            filled
            emit-value
            map-options
            multiple
            v-model="selectedData.roles"
            :options="ROLES"
            :label="$t('forms.user.fields.roles.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.user.fields.roles.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-select
            filled
            emit-value
            map-options
            v-model="selectedData.salaryCurrency"
            :options="currencyOptions"
            :label="$t('forms.user.fields.currency.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.user.fields.currency.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.salary"
            :label="$t('forms.user.fields.salary.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.salary.validation.required')]"
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
  <q-dialog v-model="showUpdateModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.user.barEdit') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
        </div>
        <div v-if="updateActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ updateActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.fullName"
            :label="$t('forms.user.fields.fullName.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.fullName.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.phone"
            :label="$t('forms.user.fields.phone.label')"
            name="First Name"
            mask="+############"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.phone.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-select
            filled
            emit-value
            map-options
            v-model="selectedData.salaryCurrency"
            :options="currencyOptions"
            :label="$t('forms.user.fields.currency.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.user.fields.currency.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.salary"
            :label="$t('forms.user.fields.salary.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.user.fields.salary.validation.required')]"
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
  <q-dialog v-model="showDeleteModal" persistent>
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
        <q-btn :label="$t('dialogs.delete.buttons.cancel')" color="primary" v-close-popup @click="clearAction" />
        <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteAction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
