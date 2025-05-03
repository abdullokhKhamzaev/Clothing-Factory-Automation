<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useCustomer } from "stores/customer.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
let props = defineProps({
  customers: {
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

const emit = defineEmits(['submit']);
const $q = useQuasar();
const { t } = useI18n();
const customer = useCustomer();

const customerLoading = ref(false);
const selectedData = ref({});
const searchTitle = ref('');
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

function getCustomers () {
  emit('submit', { fullName: searchTitle.value });
}
function createAction () {
  customerLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  customer.create(selectedData.value)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.customer.confirmation.successCreated')
      })
      clearAction();
      getCustomers();
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
    .finally(() => customerLoading.value = false);
}
function updateAction() {
  if (selectedData.value.id) {
    customerLoading.value = true;

    customer.update(selectedData.value.id, selectedData.value)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.customer.confirmation.successEdited')
        });
        clearAction();
        getCustomers()
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
    customerLoading.value = true;

    customer.deleteCustomer(selectedData.value.id)
      .then(() => {
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.customer.confirmation.successDeleted')
        });
        clearAction();
        getCustomers();
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
  <skeleton-table
    :loading="loading || customerLoading"
  />
  <q-table
    v-show="!props.loading && !customerLoading"
    flat
    bordered
    :rows="props.customers"
    :columns="columns"
    :no-data-label="$t('tables.customer.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="q-table__title full-width">
        {{ $t('tables.customer.header.title') }}
        <q-separator class="q-mt-sm q-mb-md" />
      </div>

      <div class="col-12 flex justify-between">
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
        <div class="text-right">
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.customer.buttons.add')"
            no-caps
            @click="showCreateModal = true"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div class="flex justify-end" v-if="col.name === 'action'">
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
          <div
            v-else-if="col.name === 'quantity'"
            class="flex no-wrap q-gutter-sm"
          >
            <span> {{ props.row.workerPrice }} </span>
            <span class="text-weight-bolder"> ({{ props.row.budget }}) </span>
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
            :disable="props.loading || customerLoading"
            :loading="props.loading || customerLoading"
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
            :disable="props.loading || customerLoading"
            :loading="props.loading || customerLoading"
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
          :disable="props.loading || customerLoading"
          :loading="props.loading || customerLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
