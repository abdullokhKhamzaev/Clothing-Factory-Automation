<script setup>
import { onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const { t } = useI18n();
const thread = useThread();
const threads = ref([]);
const threadMeasurementOptions = ref([
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

const showThreadCreateModal = ref(false);
const showThreadUpdateModal = ref(false);
const showThreadDeleteModal = ref(false);

const columns = [
  { name: 'name', label: t('forms.thread.fields.name.label'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('forms.thread.fields.quantity.label'), align: 'left', field: 'quantity' },
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
function clearAction() {
  selectedData.value = {};
}
function createThreadAction() {
  threadLoading.value = true;

  if ( selectedData?.value?.quantity ) {
    selectedData.value.quantity = String(selectedData.value.quantity);
  }

  thread.createThreads(selectedData.value)
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
    .finally(() => {
      threadLoading.value = false;
    })
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
function deleteThreadAction() {
  if (selectedData.value.id) {
    showThreadCreateModal.value = true;

    thread.deleteThread(selectedData.value.id)
      .then(() => {
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.thread.confirmation.successDeleted')
        });
        selectedData.value = null;
        showThreadDeleteModal.value = false;
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
      .finally(() => {
        showThreadCreateModal.value = false;
        clearAction();
      })
  } else {
    console.warn('data is empty');
  }
}

onMounted(() => {
  getThreads()
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
      <!--      <q-tab name="materials" :label="$t('materials')"/>-->
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
              <div class="q-table__title">{{ $t('threads') }}</div>
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
                  :options="threadMeasurementOptions"
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
                  :rules="[ val => val && val > 0 || $t('forms.thread.fields.quantity.validation.required')]"
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
                  :options="threadMeasurementOptions"
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
                  :rules="[ val => val && val > 0 || $t('forms.thread.fields.quantity.validation.required')]"
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
    </q-tab-panels>
  </div>
</template>
