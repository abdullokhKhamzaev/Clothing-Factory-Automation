<script setup>
import {onMounted, ref} from "vue";
import { usePaintFabric } from "stores/paintFabric.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();

const fabricLoading = ref(false);
const selectedData = ref({});
const showFabricCreateModal = ref(false);
const createActionErr = ref(null);
const showFabricUpdateModal = ref(false);
const updateActionErr = ref(null);
const showFabricDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('tables.fabric.columns.name'), align: 'left', field: 'name' },
  { name: 'address', label: t('tables.fabric.columns.address'), align: 'left', field: 'address' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = usePaintFabric();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  // ...
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchFabrics({...pagination.value, ...filters.value})
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

function createFabricAction() {
  if (fabricLoading.value) return; // Prevent multiple rapid calls

  fabricLoading.value = true;

  repository.createFabric(selectedData.value)
    .then(() => {
      showFabricCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.fabric.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.fabric.confirmation.failure')
      })
    })
    .finally(() => {
      fabricLoading.value = false;
      refresh();
    });
}
function updateFabricAction() {
  if (selectedData.value.id) {
    if (fabricLoading.value) return; // Prevent multiple rapid calls

    fabricLoading.value = true;

    repository.editFabric(selectedData.value.id, selectedData.value)
      .then(() => {
        showFabricUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.fabric.confirmation.successEdited')
        });
        clearAction();
      })
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.fabric.confirmation.failure')
        })
      })
      .finally(() => {
        fabricLoading.value = false;
        refresh();
      });
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteFabricAction() {
  if (selectedData.value.id) {
    if (fabricLoading.value) return; // Prevent multiple rapid calls

    fabricLoading.value = true;

    repository.deleteFabric(selectedData.value.id)
      .then(() => {
        showFabricDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.fabric.confirmation.successDeleted')
        });
        clearAction();
        refresh();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.fabric.confirmation.failure')
        })
      })
      .finally(() => fabricLoading.value = false)
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
    :no-data-label="$t('tables.fabric.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.fabric.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.fabric.buttons.add')"
            no-caps
            class="q-mb-md q-mb-sm-none"
            @click="showFabricCreateModal = true"
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
          <div class="flex justify-end" v-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="showFabricUpdateModal = true; selectedData = {...props.row}">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon="delete" @click="showFabricDeleteModal = true; selectedData = {...props.row}">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('delete') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>

          <div
            v-else-if="col.name === 'quantity'"
            class="flex q-gutter-sm"
          >
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ $t(props.row.measurement) }}) </span>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showFabricCreateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createFabricAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.fabric.barCreate') }} </div>
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
            v-model="selectedData.name"
            :label="$t('forms.fabric.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.fabric.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.address"
            :label="$t('forms.fabric.fields.address.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.fabric.fields.address.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || fabricLoading"
            :loading="loading || fabricLoading"
            no-caps
            :label="$t('forms.fabric.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showFabricUpdateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateFabricAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.fabric.barEdit') }} </div>
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
            v-model="selectedData.name"
            :label="$t('forms.fabric.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.fabric.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.address"
            :label="$t('forms.fabric.fields.address.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.fabric.fields.address.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || fabricLoading"
            :loading="loading || fabricLoading"
            no-caps
            :label="$t('forms.fabric.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showFabricDeleteModal" persistent @hide="clearAction">
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
          :disable="loading || fabricLoading"
          :loading="loading || fabricLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteFabricAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
