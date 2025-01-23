<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useProductModels } from "stores/productModel.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
let props = defineProps({
  models: {
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
const model = useProductModels();

const modelLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);
const rows = ref([
  { size: '', quantity: '', price: '' }
])

const columns = [
  { name: 'name', label: t('tables.model.columns.name'), align: 'left', field: 'name' },
  { name: 'description', label: t('tables.model.columns.description'), align: 'left', field: 'description' },
  { name: 'sizes', label: t('tables.model.columns.sizes'), align: 'left', field: 'sizes' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function addRow() {
  rows.value.push({ size: '', quantity: '', price: '' });
}
function removeRow(index) {
  if (this.rows.length > 1) {
    this.rows.splice(index, 1);
  }
}

function prefill() {
  let sizes = [];
  selectedData.value.sizes.forEach((size) => {
    sizes.push({ size: size.size, quantity: size.quantity, price: size.price });
  });
  rows.value = sizes;
}

function getModels () {
  emit('submit');
}
function createAction() {
  modelLoading.value = true;

  let sizes = [];

  rows.value.forEach((row) => {
    sizes.push({size: row.size, quantity: row.quantity, price: row.price});
  })

  const input = {
    name: selectedData.value.name,
    description: selectedData.value.description,
    sizes: sizes
  }

  model.create(input)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.model.confirmation.successCreated')
      })
      clearAction();
      getModels();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.model.confirmation.failure')
      })
    })
    .finally(() => modelLoading.value = false);
}
function updateAction() {
  if (selectedData.value.id) {
    modelLoading.value = true;

    let sizes = [];

    rows.value.forEach((row) => {
      sizes.push({size: row.size, quantity: row.quantity, price: row.price});
    })

    const input = {
      name: selectedData.value.name,
      description: selectedData.value.description,
      sizes: sizes
    }

    model.update(selectedData.value.id, input)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.model.confirmation.successEdited')
        });
        clearAction();
        getModels();
      })
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.model.confirmation.failure')
        })
      })
      .finally(() => modelLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}

function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  updateActionErr.value = null;
}
</script>

<template>
  <skeleton-table
    :loading="loading || modelLoading"
  />
  <q-table
    v-show="!props.loading && !modelLoading"
    flat
    bordered
    :rows="props.models"
    :columns="columns"
    :no-data-label="$t('tables.model.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.model.header.title') }}</div>
        <div class="text-right">
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.model.buttons.add')"
            no-caps
            @click="showCreateModal = true"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'sizes'">
            <div
              v-for="size in props.row.sizes"
              :key="size.id"
            >
              {{ size.size }} |
              {{ size.quantity }} |
              {{ size.price }}
            </div>
          </div>
          <div
            v-else-if="col.name === 'action'"
            class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="selectedData = {...props.row}; prefill(); showUpdateModal = true">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
            </div>
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
          <div class="text-h6"> {{ $t('dialogs.model.barCreate') }} </div>
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
            :label="$t('forms.model.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.description"
            :label="$t('forms.model.fields.description.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.description.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.model.fields.sizes.title') }}
        </div>
        <q-separator class="q-mb-md"/>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <div v-if="index" class="flex items-center">
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <q-input
            filled
            v-model="row.size"
            :label="$t('forms.model.fields.size.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.size.validation.required')]"
            class="col"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.model.fields.quantity.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.model.fields.quantity.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="row.price"
            :label="$t('forms.model.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.model.fields.price.required')]"
            class="col-6"
            hide-bottom-space
          />
        </div>
        <div class="text-right q-ma-md">
          <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || modelLoading"
            :loading="props.loading || modelLoading"
            no-caps
            :label="$t('forms.model.buttons.create')"
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
          <div class="text-h6"> {{ $t('dialogs.model.barEdit') }} </div>
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
            :label="$t('forms.model.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.description"
            :label="$t('forms.model.fields.description.label')"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.title') }}
        </div>
        <q-separator class="q-mb-md"/>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <div v-if="index" class="flex items-center">
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <q-input
            filled
            v-model="row.size"
            :label="$t('forms.model.fields.size.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.size.validation.required')]"
            class="col"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.model.fields.quantity.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.model.fields.quantity.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="row.price"
            :label="$t('forms.model.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.model.fields.price.required')]"
            class="col-6"
            hide-bottom-space
          />
        </div>
        <div class="text-right q-ma-md">
          <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || modelLoading"
            :loading="props.loading || modelLoading"
            no-caps
            :label="$t('forms.color.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<style scoped>
</style>
