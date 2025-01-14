<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import { useColor } from "stores/color.js";
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
const material = useRipeMaterial();

const materialLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);
const showDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('tables.ripeMaterial.columns.name'), align: 'left', field: 'name' },
  { name: 'paintFabricColor', label: t('tables.ripeMaterial.columns.paintFabricColor'), align: 'left', field: 'paintFabricColor' },
  { name: 'quantity', label: t('tables.ripeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.ripeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.ripeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'price', label: t('tables.ripeMaterial.columns.price'), align: 'left', field: 'price' },
  { name: 'priceSort2', label: t('tables.ripeMaterial.columns.priceSort2'), align: 'left', field: 'priceSort2' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function getMaterials () {
  emit('submit');
}
function createAction() {
  materialLoading.value = true;

  if ( selectedData?.value?.paintFabricColor['@id'] ) {
    selectedData.value.paintFabricColor = selectedData.value.paintFabricColor['@id'];
  }

  material.createRipeMaterial(selectedData.value)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterial.confirmation.successCreated')
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
        message: t('forms.ripeMaterial.confirmation.failure')
      })
    })
    .finally(() => materialLoading.value = false);
}
function updateAction() {
  if (selectedData.value.id) {
    materialLoading.value = true;

    if ( typeof selectedData?.value?.paintFabricColor === 'object' ) {
      selectedData.value.paintFabricColor = selectedData.value.paintFabricColor['@id'];
    }

    material.editRipeMaterial(selectedData.value.id, selectedData.value)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.ripeMaterial.confirmation.successEdited')
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
          message: t('forms.ripeMaterial.confirmation.failure')
        })
      })
      .finally(() => materialLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteAction() {
  if (selectedData.value.id) {
    materialLoading.value = true;

    material.deleteRipeMaterial(selectedData.value.id)
      .then(() => {
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.ripeMaterial.confirmation.successDeleted')
        });
        clearAction();
        getMaterials();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.ripeMaterial.confirmation.failure')
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

const color = useColor();
const colors = ref([]);
const colorLoading = ref(false);
const colorOptions = computed(() => {
  let options = [];
  for (let i in colors.value) {
    options.push({
      label: colors.value[i].name,
      value: colors.value[i]
    });
  }
  return options
})
function getColors () {
  colorLoading.value = true;

  color.fetchColors('')
    .then((res) => {
      colors.value = res.data['hydra:member'];
    })
    .finally(() => {
      colorLoading.value = false;
    });
}
function prefill () {
  if (selectedData.value?.paintFabricColor['@id']) {
    selectedData.value.paintFabricColor = {
      label: selectedData.value.paintFabricColor.name,
      value: selectedData.value.paintFabricColor['@id']
    }
  }
}

onMounted(() => {
  getColors();
})
</script>

<template>
  <skeleton-table
    :loading="props.loading || materialLoading"
  />
  <q-table
    v-show="!props.loading && !materialLoading"
    flat
    bordered
    :rows="props.materials"
    :columns="columns"
    :no-data-label="$t('tables.ripeMaterial.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.ripeMaterial.header.title') }}</div>
        <div class="text-right">
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.ripeMaterial.buttons.add')"
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
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="selectedData = {...props.row}; prefill(); showUpdateModal = true;">
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
            v-else-if="col.name === 'paintFabricColor'"
            class="flex q-gutter-sm"
          >
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
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
          <div class="text-h6"> {{ $t('dialogs.ripeMaterial.barCreate') }} </div>
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
            v-model="selectedData.name"
            filled
            :label="$t('forms.ripeMaterial.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.ripeMaterial.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            v-model="selectedData.measurement"
            filled
            required
            emit-value
            map-options
            :options="MEASUREMENTS"
            :label="$t('forms.ripeMaterial.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.ripeMaterial.fields.measurement.validation.required')]"
            class="col-6"
          />
          <q-select
            v-model="selectedData.paintFabricColor"
            :loading="colorLoading"
            filled
            required
            emit-value
            map-options
            :options="colorOptions"
            :label="$t('forms.ripeMaterial.fields.color.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.ripeMaterial.fields.color.validation.required')]"
            class="col-6"
          />
          <q-input
            v-model="selectedData.quantity"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.quantity.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.roll"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.roll.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterial.fields.quantity.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.quantitySort2"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.quantitySort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.quantitySort2.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.rollSort2"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.rollSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterial.fields.rollSort2.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.price"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.price.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.priceSort2"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.priceSort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.priceSort2.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.ripeMaterial.buttons.create')" type="submit" color="primary" />
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
          <div class="text-h6"> {{ $t('dialogs.ripeMaterial.barEdit') }} </div>
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
            v-model="selectedData.name"
            filled
            :label="$t('forms.ripeMaterial.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.ripeMaterial.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            v-model="selectedData.measurement"
            filled
            required
            emit-value
            map-options
            :options="MEASUREMENTS"
            :label="$t('forms.ripeMaterial.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.ripeMaterial.fields.measurement.validation.required')]"
            class="col-6"
          />
          <q-select
            v-model="selectedData.paintFabricColor"
            :loading="colorLoading"
            filled
            required
            emit-value
            map-options
            :options="colorOptions"
            :label="$t('forms.ripeMaterial.fields.color.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.ripeMaterial.fields.color.validation.required')]"
            class="col-6"
          />
          <q-input
            v-model="selectedData.quantity"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.quantity.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.roll"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.roll.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterial.fields.quantity.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.quantitySort2"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.quantitySort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.quantitySort2.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model.number="selectedData.rollSort2"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.rollSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterial.fields.rollSort2.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.price"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.price.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.priceSort2"
            filled
            type="number"
            :label="$t('forms.ripeMaterial.fields.priceSort2.label')"
            :rules="[ val => val && val > -1 || $t('forms.ripeMaterial.fields.priceSort2.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
        </div>
        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.ripeMaterial.buttons.edit')" type="submit" color="primary" />
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
