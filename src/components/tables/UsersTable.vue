<script setup>
import { computed, onMounted, ref } from "vue";
import { useDeleteUser } from "stores/user/deleteUser.js";
import { useChangeUser } from "stores/user/changeUser.js";
import { useQuasar, exportFile } from "quasar";
import { useUser } from "stores/user/createUser.js";
import { useFetchCurrencies } from "stores/currency/getCurrencies.js";

const currenyUser = useFetchCurrencies();
const $q = useQuasar();
const emit = defineEmits(['submit']);
defineProps({
  users: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    required: false,
    default: false
  }
});

const showConfirmModal = ref(false);
const showUserModal = ref(false);
const isPwd = ref(false);
const searchName = ref('');
const selectedUser = ref({});
const createUserDialog = ref(false);
function clear() {
  selectedUser.value = {};
}
const userLoading = ref(false);
const currencyLoading = ref(false);

// table settings
const visibleColumns = ref([ 'name', 'surName', 'phone', 'salary', 'salaryCurrency', 'roles' ]);
const columns = [
  { name: 'name', label: 'Ism', align: 'left', field: 'name', sortable: false, required: true },
  { name: 'phone', label: 'Telefon', align: 'left', field: 'phone' },
  { name: 'salary', label: 'Maosh', align: 'left', field: 'salary', sortable: true },
  { name: 'salaryCurrency', label: 'Valyuta', align: 'left', field: 'salaryCurrency' },
  { name: 'roles', label: 'Status', align: 'left', field: 'roles', sortable: true }
];
const currencyOptions = computed(() => {
  let options = [];
  for ( let i in currenyUser.state.currencies ) {
    options.push( {
      label: `${currenyUser.state.currencies[i].symbol} - ${currenyUser.state.currencies[i].name} (${currenyUser.state.currencies[i].shortName})`,
      value: currenyUser.state.currencies[i]['@id']
    } );
  }
  return options
})
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
function requestUsers() {
  emit('submit', { name: searchName.value });
}
function queryCurrencies () {
  currencyLoading.value = true;
  currenyUser.currenciesGet('?page=1');
  currencyLoading.value = false;
}
function createUser() {
  userLoading.value = true

  useUser().userCreate(selectedUser)
    .then(() => {
      createUserDialog.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: "Yangi foydalanuvchi qo'shildi"
      })
      selectedUser.value = null;
      requestUsers();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: "Yangi foydalanuvchi qo'shishda xatolik yuz berdi"
      })
    })
    .finally(() => {
      userLoading.value = false;
    })
}
function changeUser() {
  if (selectedUser.value.id) {
    useChangeUser().userChange(selectedUser.value.id, {
      selectedUser
    })
      .then(() => {
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: "Foydalanuvchi o'zgartirildi"
        });
        selectedUser.value = null;
        showConfirmModal.value = false;
        requestUsers();
      })
  } else {
    console.warn('user is empty');
  }
}
function removeUser() {
  if (selectedUser.value.id) {
    useDeleteUser().userDelete(selectedUser.value.id)
      .then(() => {
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: "Foydalanuvchi o'chirildi"
        });
        selectedUser.value = null;
        showConfirmModal.value = false;
        requestUsers();
      })
  } else {
    console.warn('user is empty');
  }
}
function handleEditAction(user) {
  showUserModal.value = true;
  selectedUser.value = user
  if (user?.salaryCurrency?.id) {
    selectedUser.value.salaryCurrency = {
      label: `${user.salaryCurrency.symbol} - ${user.salaryCurrency.name} (${user.salaryCurrency.shortName})`,
      value: user.salaryCurrency['@id']
    }
  }
}

onMounted(() => {
  queryCurrencies();
})
</script>

<template>
  <q-table
    flat
    bordered
    :rows="users"
    :columns="columns"
    no-data-label="tables.users.header.empty"
    title="Users"
    color="primary"
    row-key="id"
    :visible-columns="visibleColumns"
    @request="requestUsers"
  >
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>
    <template v-slot:top>
      <div class="col-12 flex">
          <q-input
            style="min-width: 225px"
            outlined
            v-model="searchName"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            label="Qidirish uchun yozing..."
            name="Name"
            clearable
            @update:model-value="requestUsers"
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
              @click="exportTable(users)"
            />
            <q-btn
              color="primary"
              icon-right="add"
              label="Qo'shish"
              no-caps
              @click="createUserDialog = true"
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
            {{ props.row.surName }}
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

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
        <q-td auto-width>
          <div class="flex no-wrap justify-end q-gutter-x-sm">
            <q-btn size="md" color="primary" rounded dense icon='edit' @click="handleEditAction(props.row)">
              <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                O'zgartirish
              </q-tooltip>
            </q-btn>
            <q-btn size="md" color="red" rounded dense icon='delete' @click="showConfirmModal = true; selectedUser = props.row">
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
  <q-dialog v-model="showConfirmModal" persistent>
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
        <q-btn label="Cancel" color="primary" v-close-popup @click="clear" />
        <q-btn label="Confirm" color="red" @click="removeUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showUserModal" persistent>
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Foydalanuvchi o'zgartirish</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="clear" />
      </q-card-section>

      <q-card-section>
        <q-form
          @submit="changeUser"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="selectedUser.name"
            label="Ism *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos ismni kiriting']"
          />
          <q-input
            filled
            v-model="selectedUser.surName"
            label="Familya *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos familyani kiriting']"
          />
          <q-input
            filled
            v-model="selectedUser.phone"
            label="Telefon *"
            name="First Name"
            mask="+############"
            :rules="[ val => val && val.length > 0 || 'Iltimos telefon raqamni kiriting']"
          />
          <q-input
            :type="isPwd ? 'password' : 'text'"
            filled
            v-model="selectedUser.password"
            label="Parol *"
            :rules="[ val => val && val.length > 0 || 'Iltimos parolni kiriting']"
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
            v-model="selectedUser.salaryCurrency"
            :options="currencyOptions"
            label="Valyuta"
            option-value="value"
            option-label="label"
          />
          <q-input
            filled
            type="number"
            v-model="selectedUser.salary"
            label="Oylik *"
            :rules="[ val => val && val.length > 0 || 'Iltimos oylikni kiriting']"
          />
          <div>
            <q-btn label="O'zgartirish" type="submit" color="primary"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="createUserDialog" persistent>
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Foydalanuvchi qo'shish</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form
          @submit="createUser"
          @reset="clear"
          class="q-gutter-md"
        >
          <q-input
            filled
            v-model="selectedUser.name"
            label="Ism *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos ismni kiriting']"
          />
          <q-input
            filled
            v-model="selectedUser.surName"
            label="Familya *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Iltimos familyani kiriting']"
          />
          <q-input
            filled
            v-model="selectedUser.phone"
            label="Telefon *"
            name="First Name"
            mask="+############"
            :rules="[ val => val && val.length > 0 || 'Iltimos telefon raqamni kiriting']"
          />

          <q-input
            :type="isPwd ? 'password' : 'text'"
            filled
            v-model="selectedUser.password"
            label="Parol *"
            :rules="[ val => val && val.length > 0 || 'Iltimos parolni kiriting']"
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
            v-model="selectedUser.salaryCurrency"
            :options="currencyOptions"
            label="Valyuta"
            option-value="value"
            option-label="label"
          />

          <q-input
            filled
            type="number"
            v-model="selectedUser.salary"
            label="Oylik *"
            :rules="[ val => val && val.length > 0 || 'Iltimos oylikni kiriting']"
          />

          <div>
            <q-btn label="Qo'shish" type="submit" color="primary"/>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
