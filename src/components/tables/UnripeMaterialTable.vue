<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useMaterial } from "stores/material.js";
import { MEASUREMENTS } from "src/libraries/constants/defaults.js";
import { useBudget } from "stores/budget.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SelectableList from "components/selectableList.vue";

// Props
let props = defineProps({
  materials: {
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
const material = useMaterial();
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

function getMaterials () {
  emit('submit');
}
function createMaterialAction () {
  materialLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  material.createMaterial(selectedData.value)
    .then(() => {
      showMaterialCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterial.confirmation.successCreated')
      })
      clearAction();
      getMaterials();
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
    .finally(() => materialLoading.value = false);
}
function updateMaterialAction() {
  if (selectedData.value.id) {
    materialLoading.value = true;

    material.editMaterial(selectedData.value.id, selectedData.value)
      .then(() => {
        showMaterialUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterial.confirmation.successEdited')
        });
        clearAction();
        getMaterials();
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
  if (selectedData.value.id) {
    materialLoading.value = true;

    material.deleteMaterial(selectedData.value.id)
      .then(() => {
        showMaterialDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterial.confirmation.successDeleted')
        });
        clearAction();
        getMaterials();
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
  <skeleton-table
    :loading="loading || materialLoading"
  />
  <q-table
    v-show="!props.loading && !materialLoading"
    flat
    bordered
    :rows="props.materials"
    :columns="columns"
    :visible-columns="visibleColumns"
    :no-data-label="$t('tables.unripeMaterial.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.unripeMaterial.header.title') }}</div>

        <div class="flex items-center justify-between q-my-md">
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
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : 'q-mr-sm'"
          />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.unripeMaterial.buttons.add')"
            no-caps
            @click="showMaterialCreateModal = true"
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
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createMaterialAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.unripeMaterial.barCreate') }} </div>
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
            :disable="props.loading || materialLoading"
            :loading="props.loading || materialLoading"
            no-caps
            :label="$t('forms.unripeMaterial.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showMaterialUpdateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateMaterialAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.unripeMaterial.barEdit') }} </div>
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
            :disable="props.loading || materialLoading"
            :loading="props.loading || materialLoading"
            no-caps
            :label="$t('forms.unripeMaterial.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
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
          :disable="props.loading || materialLoading"
          :loading="props.loading || materialLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteMaterialAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
