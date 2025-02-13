<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useAccessory } from "stores/accessory.js";
import { useBudget } from "stores/budget.js";
import { formatFloatToInteger, MEASUREMENTS, SECTION_TYPES } from "src/libraries/constants/defaults.js";
import { useAddFile } from "stores/mediaObject/addFile.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SelectableList from "components/selectableList.vue";

// Props
let props = defineProps({
  accessories: {
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
const domain = ref(import.meta.env.VITE_API_DOMEN);
const $q = useQuasar();
const { t } = useI18n();
const file = ref();
const accessory = useAccessory();
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

function getAccessories () {
  emit('submit');
}
function createAction () {
  accessoryLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  if (file.value) {
    useAddFile().addFile(file.value)
      .then((res) => {
        selectedData.value.image = res.data['@id']

        accessory.create(selectedData.value)
          .then(() => {
            showCreateModal.value = false;
            $q.notify({
              type: 'positive',
              position: 'top',
              timeout: 1000,
              message: t('forms.accessory.confirmation.successCreated')
            })
            clearAction();
            getAccessories();
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
          .finally(() => accessoryLoading.value = false);
      })
  } else {
    accessory.create(selectedData.value)
      .then(() => {
        showCreateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.successCreated')
        })
        clearAction();
        getAccessories();
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
      .finally(() => accessoryLoading.value = false);
  }
}
function updateAction() {
  if (selectedData.value.id) {
    accessoryLoading.value = true;

    accessory.update(selectedData.value.id, selectedData.value)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.successEdited')
        });
        clearAction();
        getAccessories();
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
      .finally(() => accessoryLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteAction() {
  if (selectedData.value.id) {
    accessoryLoading.value = true;

    accessory.deleteAccessory(selectedData.value.id)
      .then(() => {
        showDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.successDeleted')
        });
        clearAction();
        getAccessories();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.accessory.confirmation.failure')
        })
      })
      .finally(() => accessoryLoading.value = false)
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
  <skeleton-table
    :loading="loading || accessoryLoading"
  />
  <q-table
    v-show="!props.loading && !accessoryLoading"
    flat
    bordered
    :rows="props.accessories"
    :columns="columns"
    :no-data-label="$t('tables.accessory.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.accessory.header.title') }}</div>
        <div class="text-right">
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.accessory.buttons.add')"
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
          <div class="text-h6"> {{ $t('dialogs.accessory.barCreate') }} </div>
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
            :disable="props.loading || accessoryLoading"
            :loading="props.loading || accessoryLoading"
            no-caps
            :label="$t('forms.accessory.buttons.create')"
            type="submit"
            color="primary"
          />
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
          <div class="text-h6"> {{ $t('dialogs.accessory.barEdit') }} </div>
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
            :label="$t('forms.accessory.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.accessory.fields.name.validation.required')]"
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
            :disable="props.loading || accessoryLoading"
            :loading="props.loading || accessoryLoading"
            no-caps
            :label="$t('forms.accessory.buttons.edit')"
            type="submit"
            color="primary"
          />
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
        <q-btn
          :disable="props.loading || accessoryLoading"
          :loading="props.loading || accessoryLoading"
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
