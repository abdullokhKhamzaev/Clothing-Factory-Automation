<script setup>
import { onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import { useMaterial } from "stores/material.js";
import { usePaintFabric } from "stores/paintFabric.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const { t } = useI18n();
const thread = useThread();
const threads = ref([]);
const material = useMaterial();
const materials = ref([]);
const fabric = usePaintFabric();
const fabrics = ref([]);
const measurementOptions = ref([
  {
    label: 'KG',
    value: 'kg'
  },
  {
    label: 'Dona',
    value: 'piece'
  }
])

const selectedData = ref({});
const tab = ref('threads');
const threadLoading = ref(false);
const materialLoading = ref(false);
const fabricLoading = ref(false);

const showThreadCreateModal = ref(false);
const showThreadUpdateModal = ref(false);
const showThreadDeleteModal = ref(false);
const showMaterialCreateModal = ref(false);
const showMaterialUpdateModal = ref(false);
const showMaterialDeleteModal = ref(false);
const showFabricCreateModal = ref(false);
const showFabricUpdateModal = ref(false);
const showFabricDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('tables.thread.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.thread.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const fabricColumns = [
  { name: 'name', label: t('tables.fabric.columns.name'), align: 'left', field: 'name' },
  { name: 'address', label: t('tables.fabric.columns.address'), align: 'left', field: 'address' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function getThreads (){
  threadLoading.value = true;
  thread.fetchThreads('?page=1')
    .then((res) => {
      threads.value = res.data['hydra:member'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}
function getMaterials (){
  materialLoading.value = true;
  material.fetchMaterials('?page=1')
    .then((res) => {
      materials.value = res.data['hydra:member'];
    })
    .finally(() => {
      materialLoading.value = false;
    });
}
function getFabrics (){
  fabricLoading.value = true;
  fabric.fetchFabrics('?page=1')
    .then((res) => {
      fabrics.value = res.data['hydra:member'];
    })
    .finally(() => {
      fabricLoading.value = false;
    });
}
function clearAction() {
  selectedData.value = {};
}
function createThreadAction() {
  threadLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  thread.createThread(selectedData.value)
    .then(() => {
      showThreadCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.thread.confirmation.successCreated')
      })
      clearAction();
      getThreads();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.thread.confirmation.failure')
      })
    })
    .finally(() => threadLoading.value = false);
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
        message: t('forms.material.confirmation.successCreated')
      })
      clearAction();
      getMaterials();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.material.confirmation.failure')
      })
    })
    .finally(() => materialLoading.value = false);
}
function createFabricAction() {
  fabricLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

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
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.fabric.confirmation.failure')
      })
    })
    .finally(() => fabricLoading.value = false);
}
function updateThreadAction() {
  if (selectedData.value.id) {
    threadLoading.value = true;

    thread.editThread(selectedData.value.id, selectedData.value)
      .then(() => {
        showThreadUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.thread.confirmation.successEdited')
        });
        clearAction();
        getThreads();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.thread.confirmation.failure')
        })
      })
      .finally(() => threadLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
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
          message: t('forms.material.confirmation.successEdited')
        });
        clearAction();
        getMaterials();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.material.confirmation.failure')
        })
      })
      .finally(() => materialLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
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
      .catch(() => {
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
function deleteThreadAction() {
  if (selectedData.value.id) {
    threadLoading.value = true;

    thread.deleteThread(selectedData.value.id)
      .then(() => {
        showThreadDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.thread.confirmation.successDeleted')
        });
        clearAction();
        getThreads();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.thread.confirmation.failure')
        })
      })
      .finally(() => threadLoading.value = false)
  } else {
    console.warn('data is empty');
  }
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
          message: t('forms.material.confirmation.successDeleted')
        });
        clearAction();
        getMaterials();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.material.confirmation.failure')
        })
      })
      .finally(() => materialLoading.value = false)
  } else {
    console.warn('data is empty');
  }
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

onMounted(() => {
  getThreads();
  getMaterials();
  getFabrics();
})
</script>

<template>
  <div class="q-mx-md q-mt-md flex-block" :style="$q.screen.xs ? '' : 'max-width: 300px'">
    <q-tabs
      v-model="tab"
      no-caps
      dense
      outside-arrows
      mobile-arrows
      class="shadow-2 text-primary"
    >
      <q-tab name="threads" :label="$t('threads')"/>
      <q-tab name="materials" :label="$t('materials')"/>
      <q-tab name="fabrics" :label="$t('fabrics')"/>
    </q-tabs>
  </div>

  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="threads">
        <q-table
          flat
          bordered
          :rows="threads"
          :columns="columns"
          :no-data-label="$t('tables.thread.header.empty')"
          :loading="threadLoading"
          color="primary"
          row-key="id"
          hide-bottom
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top>
            <div class="col-12 flex justify-between">
              <div class="q-table__title">{{ $t('tables.thread.header.title') }}</div>
              <div class="text-right">
                <q-btn
                  color="primary"
                  icon-right="add"
                  :label="$t('tables.thread.buttons.add')"
                  no-caps
                  @click="showThreadCreateModal = true"
                />
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in columns" :key="col.name" :props="props">
                <div class="flex justify-end" v-if="col.name === 'action'">
                  <div class="flex no-wrap q-gutter-x-sm">
                    <q-btn size="md" color="primary" rounded dense icon="edit" @click="showThreadUpdateModal = true; selectedData = props.row">
                      <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                        {{ $t('edit') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn size="md" color="red" rounded dense icon="delete" @click="showThreadDeleteModal = true; selectedData = props.row">
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
        <q-dialog v-model="showThreadCreateModal" persistent>
          <div
            class="bg-white shadow-3"
            style="width: 900px; max-width: 80vw;"
          >
            <q-form @submit.prevent="createThreadAction">
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.thread.barCreate') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
              </div>
              <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
                <q-input
                  filled
                  v-model="selectedData.name"
                  :label="$t('forms.thread.fields.name.label')"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || $t('forms.thread.fields.name.validation.required')]"
                  class="col-12"
                  hide-bottom-space
                />
                <q-select
                  filled
                  required
                  emit-value
                  map-options
                  v-model="selectedData.measurement"
                  :options="measurementOptions"
                  :label="$t('forms.thread.fields.measurement.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.thread.fields.measurement.validation.required')]"
                  class="col-3"
                />
                <q-input
                  filled
                  type="number"
                  v-model="selectedData.quantity"
                  :label="$t('forms.thread.fields.quantity.label')"
                  :rules="[ val => val && val > -1 || $t('forms.thread.fields.quantity.validation.required')]"
                  class="col-9"
                  hide-bottom-space
                />
              </div>

              <q-separator />

              <div class="q-px-md q-py-sm text-center">
                <q-btn no-caps :label="$t('forms.thread.buttons.create')" type="submit" color="primary" />
              </div>
            </q-form>
          </div>
        </q-dialog>
        <q-dialog v-model="showThreadUpdateModal" persistent>
          <div
            class="bg-white shadow-3"
            style="width: 900px; max-width: 80vw;"
          >
            <q-form @submit.prevent="updateThreadAction">
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.thread.barEdit') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
              </div>
              <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
                <q-input
                  filled
                  v-model="selectedData.name"
                  :label="$t('forms.thread.fields.name.label')"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || $t('forms.thread.fields.name.validation.required')]"
                  class="col-12"
                  hide-bottom-space
                />
                <q-select
                  filled
                  required
                  emit-value
                  map-options
                  v-model="selectedData.measurement"
                  :options="measurementOptions"
                  :label="$t('forms.thread.fields.measurement.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.thread.fields.measurement.validation.required')]"
                  class="col-3"
                />
                <q-input
                  filled
                  type="number"
                  v-model="selectedData.quantity"
                  :label="$t('forms.thread.fields.quantity.label')"
                  :rules="[ val => val && val > -1 || $t('forms.thread.fields.quantity.validation.required')]"
                  class="col-9"
                  hide-bottom-space
                />
              </div>

              <q-separator />

              <div class="q-px-md q-py-sm text-center">
                <q-btn no-caps :label="$t('forms.thread.buttons.edit')" type="submit" color="primary" />
              </div>
            </q-form>
          </div>
        </q-dialog>
        <q-dialog v-model="showThreadDeleteModal" persistent>
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
              <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteThreadAction" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>
      <q-tab-panel name="materials">
        <q-table
          flat
          bordered
          :rows="materials"
          :columns="columns"
          :no-data-label="$t('tables.material.header.empty')"
          :loading="materialLoading"
          color="primary"
          row-key="id"
          hide-bottom
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top>
            <div class="col-12 flex justify-between">
              <div class="q-table__title">{{ $t('tables.material.header.title') }}</div>
              <div class="text-right">
                <q-btn
                  color="primary"
                  icon-right="add"
                  :label="$t('tables.material.buttons.add')"
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
                    <q-btn size="md" color="primary" rounded dense icon="edit" @click="showMaterialUpdateModal = true; selectedData = props.row">
                      <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                        {{ $t('edit') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn size="md" color="red" rounded dense icon="delete" @click="showMaterialDeleteModal = true; selectedData = props.row">
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
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.material.barCreate') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
              </div>
              <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
                <q-input
                  filled
                  v-model="selectedData.name"
                  :label="$t('forms.material.fields.name.label')"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || $t('forms.material.fields.name.validation.required')]"
                  class="col-12"
                  hide-bottom-space
                />
                <q-select
                  filled
                  required
                  emit-value
                  map-options
                  v-model="selectedData.measurement"
                  :options="measurementOptions"
                  :label="$t('forms.material.fields.measurement.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.material.fields.measurement.validation.required')]"
                  class="col-3"
                />
                <q-input
                  filled
                  type="number"
                  v-model="selectedData.quantity"
                  :label="$t('forms.thread.fields.quantity.label')"
                  :rules="[ val => val && val > -1 || $t('forms.material.fields.quantity.validation.required')]"
                  class="col-9"
                  hide-bottom-space
                />
              </div>

              <q-separator />

              <div class="q-px-md q-py-sm text-center">
                <q-btn no-caps :label="$t('forms.material.buttons.create')" type="submit" color="primary" />
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
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.material.barEdit') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
              </div>
              <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
                <q-input
                  filled
                  v-model="selectedData.name"
                  :label="$t('forms.material.fields.name.label')"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || $t('forms.material.fields.name.validation.required')]"
                  class="col-12"
                  hide-bottom-space
                />
                <q-select
                  filled
                  required
                  emit-value
                  map-options
                  v-model="selectedData.measurement"
                  :options="measurementOptions"
                  :label="$t('forms.material.fields.measurement.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.material.fields.measurement.validation.required')]"
                  class="col-3"
                />
                <q-input
                  filled
                  type="number"
                  v-model="selectedData.quantity"
                  :label="$t('forms.material.fields.quantity.label')"
                  :rules="[ val => val && val > -1 || $t('forms.material.fields.quantity.validation.required')]"
                  class="col-9"
                  hide-bottom-space
                />
              </div>

              <q-separator />

              <div class="q-px-md q-py-sm text-center">
                <q-btn no-caps :label="$t('forms.material.buttons.edit')" type="submit" color="primary" />
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
      </q-tab-panel>
      <q-tab-panel name="fabrics">
        <q-table
          flat
          bordered
          :rows="fabrics"
          :columns="fabricColumns"
          :no-data-label="$t('tables.fabric.header.empty')"
          :loading="fabricLoading"
          color="primary"
          row-key="id"
          hide-bottom
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
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
              <q-td v-for="col in fabricColumns" :key="col.name" :props="props">
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
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.fabric.barCreate') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
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
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.fabric.barEdit') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
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
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
