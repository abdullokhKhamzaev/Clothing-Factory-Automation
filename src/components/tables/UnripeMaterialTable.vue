<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useMaterial } from "stores/material.js";
import { MEASUREMENTS } from "src/libraries/constants/defaults.js";
import { useBudget } from "stores/budget.js";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const budget = useBudget();

const materialLoading = ref(false);
const selectedData = ref({});
const showMaterialCreateModal = ref(false);
const createActionErr = ref(null);
const showMaterialUpdateModal = ref(false);
const updateActionErr = ref(null);
const showMaterialDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('tables.unripeMaterial.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.unripeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.unripeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.unripeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.unripeMaterial.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'payWorker', label: t('tables.unripeMaterial.columns.payWorker'), align: 'left', field: 'payWorker' },
  { name: 'price', label: t('tables.unripeMaterial.columns.price'), align: 'left', field: 'price' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));
// Table Data
const repository = useMaterial();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  name: null
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchMaterials({...pagination.value, ...filters.value})
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

function createMaterialAction () {
  if (materialLoading.value) return; // Prevent multiple rapid calls

  materialLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  repository.createMaterial(selectedData.value)
    .then(() => {
      showMaterialCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterial.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterial.confirmation.failure')
      })
    })
    .finally(() => {
      materialLoading.value = false;
      refresh();
    });
}
function updateMaterialAction() {
  if (materialLoading.value) return; // Prevent multiple rapid calls

  if (selectedData.value.id) {
    materialLoading.value = true;

    repository.editMaterial(selectedData.value.id, selectedData.value)
      .then(() => {
        showMaterialUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterial.confirmation.successEdited')
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
          message: t('forms.unripeMaterial.confirmation.failure')
        })
      })
      .finally(() => materialLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteMaterialAction() {
  if (materialLoading.value) return; // Prevent multiple rapid calls

  if (selectedData.value.id) {
    materialLoading.value = true;

    repository.deleteMaterial(selectedData.value.id)
      .then(() => {
        showMaterialDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterial.confirmation.successDeleted')
        });
        clearAction();
        refresh();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterial.confirmation.failure')
        })
      })
      .finally(() => materialLoading.value = false)
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
    :no-data-label="$t('tables.unripeMaterial.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.unripeMaterial.header.title') }}</div>

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
            :label="$t('tables.unripeMaterial.buttons.add')"
            no-caps
            class="q-mb-md q-mb-sm-none"
            @click="showMaterialCreateModal = true"
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
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="showMaterialUpdateModal = true; selectedData = {...props.row}">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon="delete" @click="showMaterialDeleteModal = true; selectedData = {...props.row}">
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
            {{ props.row.price }} $
          </div>

          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showMaterialCreateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createMaterialAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.unripeMaterial.barCreate') }} </div>
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
            :label="$t('forms.unripeMaterial.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.unripeMaterial.fields.name.validation.required')]"
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
            :label="$t('forms.unripeMaterial.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.unripeMaterial.fields.measurement.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.payWorker"
            prefix="so'm:"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.payWorker.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.payWorker.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.payWorkerSort2"
            prefix="so'm:"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.payWorkerSort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.payWorkerSort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.unripeMaterial.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.roll"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.roll.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.unripeMaterial.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.quantitySort2"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.quantitySort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.quantitySort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.rollSort2"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.rollSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.unripeMaterial.fields.rollSort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.unripeMaterial.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.unripeMaterial.fields.budget.validation.required')"
            class="col-12"
          />
          <q-input
            v-model="selectedData.price"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.price.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || materialLoading"
            :loading="loading || materialLoading"
            no-caps
            :label="$t('forms.unripeMaterial.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showMaterialUpdateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="updateMaterialAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.unripeMaterial.barEdit') }} </div>
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
            :label="$t('forms.unripeMaterial.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.unripeMaterial.fields.name.validation.required')]"
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
            :label="$t('forms.unripeMaterial.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.unripeMaterial.fields.measurement.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.payWorker"
            prefix="so'm:"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.payWorker.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.payWorker.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.unripeMaterial.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.roll"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.roll.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.unripeMaterial.fields.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.quantitySort2"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.quantitySort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.quantitySort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.rollSort2"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.rollSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.unripeMaterial.fields.rollSort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.price"
            prefix="$"
            filled
            type="number"
            :label="$t('forms.unripeMaterial.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.price.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || materialLoading"
            :loading="loading || materialLoading"
            no-caps
            :label="$t('forms.unripeMaterial.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showMaterialDeleteModal" persistent @hide="clearAction">
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
          :disable="loading || materialLoading"
          :loading="loading || materialLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteMaterialAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
