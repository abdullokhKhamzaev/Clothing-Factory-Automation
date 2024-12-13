<script setup>
import { ref } from "vue";
import { useDeleteUser } from "stores/user/deleteUser.js";
import { useQuasar } from "quasar";

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
const searchName = ref('');
const selectedUser = ref(null);

// table settings
const visibleColumns = ref([ 'name', 'phone', 'salary', 'salaryCurrency', 'roles' ]);
const columns = [
  { name: 'name', label: 'Ism', align: 'left', field: 'name', sortable: false, required: true },
  { name: 'phone', label: 'Telefon', align: 'left', field: 'phone' },
  { name: 'salary', label: 'Maosh', align: 'left', field: 'salary', sortable: true },
  { name: 'salaryCurrency', label: 'Valyuta', align: 'left', field: 'salaryCurrency' },
  { name: 'roles', label: 'Status', align: 'left', field: 'roles', sortable: true }
];
function requestUsers() {
  emit('submit', { name: name.value });
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
</script>

<template>
  <q-table
    flat
    bordered
    :rows="users"
    :columns="columns"
    no-data-label="tables.users.header.empty"
    color="primary"
    row-key="id"
    :visible-columns="visibleColumns"
    @request="requestUsers"
  >
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>
    <template v-slot:top>
      <div class="col-12 flex justify-between">
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
          style="min-width: 150px"
          :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
        />
        <q-input
          outlined
          v-model="searchName"
          :class="$q.screen.lt.sm ? 'full-width' : false"
          label="Ism"
          name="Name"
          clearable
          @update:model-value="requestUsers"
          :debounce="1000"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
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

          <div v-else-if="col.name === 'roles'">
            <span v-for="role in props.row.roles" :key="role">
              {{ role }}
            </span>
          </div>

          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
        <q-td auto-width>
          <div class="flex no-wrap justify-end q-gutter-x-sm">
            <q-btn size="md" color="primary" rounded dense icon='edit'>
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
        <q-btn label="Cancel" color="primary" v-close-popup @click="selectedUser = null" />
        <q-btn label="Confirm" color="red" @click="removeUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
