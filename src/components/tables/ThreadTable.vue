<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useThread } from "stores/thread.js";
import { useBudget } from "stores/budget.js";
import { MEASUREMENTS } from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SelectableList from "components/selectableList.vue";

// Props
let props = defineProps({
  threads: {
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
const thread = useThread();
const budget = useBudget();

const threadLoading = ref(false);
const selectedData = ref({});
const showThreadCreateModal = ref(false);
const createActionErr = ref(null);
const showThreadUpdateModal = ref(false);
const updateActionErr = ref(null);
const showThreadDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('tables.thread.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.thread.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function getThreads () {
  emit('submit');
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
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.thread.confirmation.failure')
      })
    })
    .finally(() => threadLoading.value = false);
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
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];
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
function prefill () {
  if (selectedData?.value?.budget && selectedData.value.budget['@id']) {
    selectedData.value.budget = selectedData.value.budget['@id']
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
    :loading="loading || threadLoading"
  />
  <q-table
    v-show="!props.loading && !threadLoading"
    flat
    bordered
    :rows="props.threads"
    :columns="columns"
    :no-data-label="$t('tables.thread.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
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
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="selectedData = {...props.row}; prefill(); showThreadUpdateModal = true">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon="delete" @click="showThreadDeleteModal = true; selectedData = {...props.row}">
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
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.thread.barCreate') }} </div>
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
            :options="MEASUREMENTS"
            :label="$t('forms.thread.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.thread.fields.measurement.validation.required')]"
            class="col-12 col-sm-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.thread.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.thread.fields.quantity.validation.required')]"
            class="col-12 col-sm-6"
            hide-bottom-space
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.thread.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.thread.fields.budget.validation.required')"
            class="col-12 col-sm-6"
          />
          <q-input
            v-model="selectedData.price"
            type="number"
            filled
            :disable="!selectedData.budget"
            :label="$t('forms.thread.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 || $t('forms.thread.fields.price.validation.required')]"
            hide-bottom-space
            class="col-12 col-sm-6"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || threadLoading"
            :loading="props.loading || threadLoading"
            no-caps
            :label="$t('forms.thread.buttons.create')"
            type="submit"
            color="primary"
          />
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
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.thread.barEdit') }} </div>
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
            :options="MEASUREMENTS"
            :label="$t('forms.thread.fields.measurement.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.thread.fields.measurement.validation.required')]"
            class="col-12 col-sm-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.thread.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.thread.fields.quantity.validation.required')]"
            class="col-12 col-sm-6"
            hide-bottom-space
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.thread.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.thread.fields.budget.validation.required')"
            class="col-12 col-sm-6"
          />
          <q-input
            v-model="selectedData.price"
            type="number"
            filled
            :disable="!selectedData.budget"
            :label="$t('forms.thread.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 || $t('forms.thread.fields.price.validation.required')]"
            hide-bottom-space
            class="col-12 col-sm-6"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || threadLoading"
            :loading="props.loading || threadLoading"
            no-caps
            :label="$t('forms.thread.buttons.edit')"
            type="submit"
            color="primary"
          />
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
        <q-btn
          :disable="props.loading || threadLoading"
          :loading="props.loading || threadLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteThreadAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
