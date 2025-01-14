<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useMaterial } from "stores/material.js";
import { MEASUREMENTS } from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

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
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function getMaterials () {
  emit('submit');
}
function createMaterialAction() {
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
    :no-data-label="$t('tables.unripeMaterial.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.unripeMaterial.header.title') }}</div>
        <div class="text-right">
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
            class="flex q-gutter-sm"
          >
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showMaterialCreateModal" persistent>
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
            class="col-3"
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.unripeMaterial.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.quantity.validation.required')]"
            class="col-9"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.unripeMaterial.buttons.create')" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showMaterialUpdateModal" persistent>
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
            class="col-3"
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.unripeMaterial.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterial.fields.quantity.validation.required')]"
            class="col-9"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.unripeMaterial.buttons.edit')" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showMaterialDeleteModal" persistent>
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
        <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteMaterialAction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
