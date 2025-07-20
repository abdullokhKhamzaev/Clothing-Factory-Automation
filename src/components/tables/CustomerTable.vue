<script setup>
import {onMounted, ref} from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useCustomer } from "stores/customer.js";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();

const customerLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);
const showDeleteModal = ref(false);

const columns = [
  { name: 'fullName', label: t('tables.customer.columns.fullName'), align: 'left', field: 'fullName' },
  { name: 'username', label: t('tables.customer.columns.username'), align: 'left', field: 'username' },
  { name: 'phone', label: t('tables.customer.columns.phone'), align: 'left', field: 'phone' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useCustomer();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  fullName: '',
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchCustomers({...pagination.value, ...filters.value})
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

function createAction () {
  if (customerLoading.value) return; // Prevent multiple rapid calls

  customerLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  repository.create(selectedData.value)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.customer.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.customer.confirmation.failure')
      })
    })
    .finally(() => {
      customerLoading.value = false;
      refresh()
    });
}
function updateAction() {
  if (selectedData.value.id) {
    if (customerLoading.value) return; // Prevent multiple rapid calls

    customerLoading.value = true;

    repository.update(selectedData.value.id, selectedData.value)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.customer.confirmation.successEdited')
        });
        clearAction();
        refresh();
      })
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.customer.confirmation.failure')
        })
      })
      .finally(() => customerLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteAction() {
  if (selectedData.value.id) {
    if (customerLoading.value) return; // Prevent multiple rapid calls

    customerLoading.value = true;

    repository.deleteCustomer(selectedData.value.id)
      .then(() => {
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.customer.confirmation.successDeleted')
        });
        clearAction();
        refresh();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.customer.confirmation.failure')
        })
      })
      .finally(() => customerLoading.value = false)
  } else {
    console.warn('data is empty');
  }
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  updateActionErr.value = null;
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.customer.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.customer.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <q-input
            style="min-width: 225px"
            dense
            outlined
            clearable
            v-model="filters.fullName"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            :label="$t('tables.users.header.searchTitle')"
            :debounce="1000"
            @update:model-value="getItems"
          >
            <template v-slot:append>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.customer.buttons.add')"
            no-caps
            @click="showCreateModal = true"
          />
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
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'fullName'">
            <router-link
              class="text-black"
              :to="{
                name: 'club.customer',
                params: { id:props.row.id },
                state: { customer: props.row }
              }"
            >
              {{ props.row.fullName }}
            </router-link>
          </div>
          <div class="flex justify-end" v-else-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="showUpdateModal = true; selectedData = {...props.row}">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon="delete" @click="showDeleteModal = true; selectedData = {...props.row}">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('delete') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
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
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.customer.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
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
            :label="$t('forms.customer.fields.fullName.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.customer.fields.fullName.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.username"
            :label="$t('forms.customer.fields.username.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.customer.fields.username.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.phone"
            :label="$t('forms.customer.fields.phone.label')"
            name="First Name"
            mask="+#################"
            :rules="[ val => val && val.length > 0 || $t('forms.customer.fields.phone.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || customerLoading"
            :loading="loading || customerLoading"
            no-caps
            :label="$t('forms.customer.buttons.create')"
            type="submit"
            color="primary"
          />
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
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.customer.barEdit') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
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
            :label="$t('forms.customer.fields.fullName.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.customer.fields.fullName.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.username"
            :label="$t('forms.customer.fields.username.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.customer.fields.username.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.phone"
            :label="$t('forms.customer.fields.phone.label')"
            name="First Name"
            mask="+#################"
            :rules="[ val => val && val.length > 0 || $t('forms.customer.fields.phone.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || customerLoading"
            :loading="loading || customerLoading"
            no-caps
            :label="$t('forms.customer.buttons.edit')"
            type="submit"
            color="primary"
          />
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
        <q-btn
          :disable="loading || customerLoading"
          :loading="loading || customerLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
