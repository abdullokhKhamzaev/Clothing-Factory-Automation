<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { usePaintFabric } from "stores/paintFabric.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

// Props
let props = defineProps({
  fabrics: {
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
const fabric = usePaintFabric();

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

function getFabrics () {
  emit('submit');
}
function createFabricAction() {
  fabricLoading.value = true;

  fabric.createFabric(selectedData.value)
    .then(() => {
      showFabricCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.fabric.confirmation.successCreated')
      })
      clearAction();
      getFabrics();
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
    .finally(() => fabricLoading.value = false);
}
function updateFabricAction() {
  if (selectedData.value.id) {
    fabricLoading.value = true;

    fabric.editFabric(selectedData.value.id, selectedData.value)
      .then(() => {
        showFabricUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.fabric.confirmation.successEdited')
        });
        clearAction();
        getFabrics();
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
      .finally(() => fabricLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}
function deleteFabricAction() {
  if (selectedData.value.id) {
    fabricLoading.value = true;

    fabric.deleteFabric(selectedData.value.id)
      .then(() => {
        showFabricDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.fabric.confirmation.successDeleted')
        });
        clearAction();
        getFabrics();
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
  <skeleton-table
    :loading="loading || fabricLoading"
  />
  <q-table
    v-show="!props.loading && !fabricLoading"
    flat
    bordered
    :rows="props.fabrics"
    :columns="columns"
    :no-data-label="$t('tables.fabric.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex justify-between">
        <div class="q-table__title">{{ $t('tables.fabric.header.title') }}</div>
        <div class="text-right">
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.fabric.buttons.add')"
            no-caps
            @click="showFabricCreateModal = true"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div class="flex justify-end" v-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="showFabricUpdateModal = true; selectedData = props.row">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon="delete" @click="showFabricDeleteModal = true; selectedData = props.row">
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
  <q-dialog v-model="showFabricCreateModal" persistent>
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
          <q-btn no-caps :label="$t('forms.fabric.buttons.create')" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showFabricUpdateModal" persistent>
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
          <q-btn no-caps :label="$t('forms.fabric.buttons.edit')" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showFabricDeleteModal" persistent>
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
        <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteFabricAction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
