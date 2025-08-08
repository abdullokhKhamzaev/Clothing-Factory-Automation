<script setup>
import {onMounted, ref} from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useAccessory } from "stores/accessory.js";
import { useBudget } from "stores/budget.js";
import { formatFloatToInteger, MEASUREMENTS, SECTION_TYPES } from "src/libraries/constants/defaults.js";
import { useAddFile } from "stores/mediaObject/addFile.js";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const domain = ref(import.meta.env.VITE_API_DOMEN);
const $q = useQuasar();
const { t } = useI18n();
const file = ref();
const budget = useBudget();

const accessoryLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);
const showDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('tables.accessory.columns.name'), align: 'left', field: 'name' },
  { name: 'image', label: t('tables.accessory.columns.image'), align: 'left', field: 'image' },
  { name: 'quantity', label: t('tables.accessory.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.accessory.columns.price'), align: 'left', field: 'price' },
  { name: 'type', label: t('tables.accessory.columns.type'), align: 'left', field: 'type' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useAccessory();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  name: null,
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchAccessories({...pagination.value, ...filters.value})
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
  if (accessoryLoading.value) return; // Prevent multiple rapid calls
  accessoryLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  if (file.value) {
    useAddFile().addFile(file.value)
      .then((res) => {
        selectedData.value.image = res.data['@id']

        repository.create(selectedData.value)
          .then(() => {
            showCreateModal.value = false;
            $q.notify({
              type: 'positive',
              position: 'top',
              timeout: 1000,
              message: t('forms.accessory.confirmation.successCreated')
            })
            clearAction();
          })
          .catch((res) => {
            createActionErr.value = res.response.data['hydra:description'];

            $q.notify({
              type: 'negative',
              position: 'top',
              timeout: 1000,
              message: t('forms.accessory.confirmation.failure')
            })
          })
          .finally(() => {
            accessoryLoading.value = false;
            refresh();
          });
      })
  } else {
    repository.create(selectedData.value)
      .then(() => {
        showCreateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.successCreated')
        })
        clearAction();
      })
      .catch((res) => {
        createActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.failure')
        })
      })
      .finally(() => {
        accessoryLoading.value = false;
        refresh();
      });
  }
}
function updateAction() {
  if (selectedData.value.id) {
    if (accessoryLoading.value) return; // Prevent multiple rapid calls
    accessoryLoading.value = true;

    repository.update(selectedData.value.id, selectedData.value)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.successEdited')
        });
        clearAction();
      })
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.failure')
        })
      })
      .finally(() => {
        accessoryLoading.value = false;
        refresh();
      });
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteAction() {
  if (selectedData.value.id) {
    if (accessoryLoading.value) return; // Prevent multiple rapid calls
    accessoryLoading.value = true;

    repository.deleteAccessory(selectedData.value.id)
      .then(() => {
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.successDeleted')
        });
        clearAction();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.failure')
        })
      })
      .finally(() => {
        accessoryLoading.value = false;
        refresh();
      })
  } else {
    console.warn('data is empty');
  }
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  updateActionErr.value = null;
  file.value = null;
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.accessory.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.accessory.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-input
            style="min-width: 225px"
            dense
            outlined
            clearable
            v-model="filters.name"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            :label="$t('tables.users.header.searchTitle')"
            :debounce="1000"
            @update:model-value="getItems"
          >
            <template v-slot:append>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.accessory.buttons.add')"
            no-caps
            class="q-mb-md q-mb-sm-none"
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
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ $t(props.row.measurement) }}) </span>
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price) }}
          </div>
          <div v-else-if="col.name === 'image'">
            <q-img
              v-if="props?.row?.image?.contentUrl"
              :src="domain + props.row.image.contentUrl"
              style="max-width: 50px"
            />
            <div v-else>
              -
            </div>
          </div>
          <div v-else-if="col.name === 'type'">
            {{ $t(props.row.type) }}
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
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.accessory.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="createActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
            />
            {{ createActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.accessory.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.accessory.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-file
            v-model="file"
            :label="$t('forms.accessory.fields.image.label')"
            clearable
            filled
            accept="image/*"
            class="col-12"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-select
            clearable
            filled
            required
            emit-value
            map-options
            v-model="selectedData.type"
            :options="SECTION_TYPES"
            :label="$t('forms.accessory.fields.type.label')"
            option-value="value"
            :option-label="option => $t(option.label)"
            :rules="[val => !!val || $t('forms.accessory.fields.type.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            filled
            required
            emit-value
            map-options
            v-model="selectedData.measurement"
            :options="MEASUREMENTS"
            :label="$t('forms.accessory.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.accessory.fields.measurement.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.accessory.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.accessory.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.accessory.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.accessory.fields.budget.validation.required')"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.price"
            :disable="!selectedData.budget"
            filled
            type="number"
            :label="$t('forms.accessory.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.accessory.fields.price.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || accessoryLoading"
            :loading="loading || accessoryLoading"
            no-caps
            :label="$t('forms.accessory.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showUpdateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="updateAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.accessory.barEdit') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="updateActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
            />
            {{ updateActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.accessory.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.accessory.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            clearable
            filled
            required
            emit-value
            map-options
            v-model="selectedData.type"
            :options="SECTION_TYPES"
            :label="$t('forms.accessory.fields.type.label')"
            option-value="value"
            :option-label="option => $t(option.label)"
            :rules="[val => !!val || $t('forms.accessory.fields.type.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            filled
            required
            emit-value
            map-options
            v-model="selectedData.measurement"
            :options="MEASUREMENTS"
            :label="$t('forms.accessory.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.accessory.fields.measurement.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.accessory.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.accessory.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.accessory.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.accessory.fields.budget.validation.required')"
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.price"
            :disable="!selectedData.budget"
            filled
            type="number"
            :label="$t('forms.accessory.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.accessory.fields.price.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || accessoryLoading"
            :loading="loading || accessoryLoading"
            no-caps
            :label="$t('forms.accessory.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
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
          :disable="loading || accessoryLoading"
          :loading="loading || accessoryLoading"
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
