<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useAbout } from "stores/user/about.js";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import { usePaintFabric } from "stores/paintFabric.js";
import { useRipeMaterialRepaint } from "stores/ripeMaterialRepaint.js";
import { DATE_FORMAT, formatDate, isToday } from "src/libraries/constants/defaults.js";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const ripeMaterial = useRipeMaterial();
const fabric = usePaintFabric();

const selectedData = ref({});
const showCreateModal = ref(false);
const showReceiveModal = ref(false);
const createActionErr = ref(null);
const receiveActionErr = ref(null);
const paintLoading = ref(false);

const columns = [
  { name: 'id', label: "#ID", align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.repaint.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'ripeMaterial', label: t('tables.repaint.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'createdBy', label: t('tables.repaint.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'paintFabric', label: t('tables.repaint.columns.paintFabric'), align: 'left', field: 'paintFabric' },
  { name: 'sentQuantitySort1', label: t('tables.repaint.columns.sentQuantitySort1'), align: 'left', field: 'sentQuantitySort1' },
  { name: 'sentRollSort1', label: t('tables.repaint.columns.sentRollSort1'), align: 'left', field: 'sentRollSort1' },
  { name: 'sentQuantitySort2', label: t('tables.repaint.columns.sentQuantitySort2'), align: 'left', field: 'sentQuantitySort2' },
  { name: 'sentRollSort2', label: t('tables.repaint.columns.sentRollSort2'), align: 'left', field: 'sentRollSort2' },
  { name: 'dealDate', label: t('tables.repaint.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'status', label: t('tables.repaint.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];
const visibleColumns = ref(columns.map(column => column.name));
// Table Data
const repository = useRipeMaterialRepaint();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  status: 'expected'
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchRepaintOrders({...pagination.value, ...filters.value})
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

function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  receiveActionErr.value = null;
}
function createAction() {
  if (paintLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  paintLoading.value = true;

  let input;

  if (selectedData.value.whichSort === 1) {
    input = {
      ripeMaterial: selectedData.value.ripeMaterial,
      sentQuantitySort1: selectedData.value.sentQuantitySort1,
      sentRollSort1: selectedData.value.sentRollSort1,
      createdBy: user.about['@id'],
      paintFabric: selectedData.value.paintFabric,
      dealDate: selectedData.value.dealDate
    }
  } else if (selectedData.value.whichSort === 2) {
    input = {
      ripeMaterial: selectedData.value.ripeMaterial,
      sentQuantitySort2: selectedData.value.sentQuantitySort2,
      sentRollSort2: selectedData.value.sentRollSort2,
      createdBy: user.about['@id'],
      paintFabric: selectedData.value.paintFabric,
      dealDate: selectedData.value.dealDate,
    }
  }

  repository.createOrder(input)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.repaint.confirmation.successOrderCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.repaint.confirmation.failure')
      })
    })
    .finally(() => {
      paintLoading.value = false;
      refresh();
    })
}
function receiveAction() {
  if (paintLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value.id) {
    console.warn('data not found');
    return
  }

  paintLoading.value = true;

  let input = {
    status: "received",
    receivedBy: user.about['@id'],
    receivedAt: new Date().toISOString(),
    receivedQuantitySort1: selectedData.value.receivedQuantitySort1,
    receivedRollSort1: selectedData.value.receivedRollSort1,
    receivedQuantitySort2: selectedData.value.receivedQuantitySort2,
    receivedRollSort2: selectedData.value.receivedRollSort2,
  };

  repository.receive(selectedData.value.id, input)
    .then(() => {
      showReceiveModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.repaint.confirmation.successOrderReceived')
      })
      clearAction();
    })
    .catch((res) => {
      receiveActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.repaint.confirmation.failure')
      })
    })
    .finally(() => {
      paintLoading.value = false;
      refresh();
    })
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.repaint.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.repaint.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            no-caps
            :label="$t('tables.repaint.buttons.add')"
            color="primary"
            class="q-mb-md q-mb-sm-none"
            @click="showCreateModal = true"
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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green text-white'">
          <div v-if="col.name === 'action' && props.row.status === 'expected'" class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                size="md"
                no-caps
                dense
                :label="$t('receive')"
                color="green"
                @click="showReceiveModal = true; selectedData = {...props.row}"
              />
            </div>
          </div>
          <div v-else-if="col.name === 'ripeMaterial'">
            {{ props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row.createdBy.fullName }}
          </div>
          <div v-else-if="col.name === 'paintFabric'">
            {{ props.row.paintFabric.name }}
          </div>
          <div v-else-if="col.name === 'sentQuantitySort1'">
            {{ Number(props.row.sentQuantitySort1) > 0 ? `${props.row.sentQuantitySort1} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'sentRollSort1'">
            {{ Number(props.row.sentRollSort1) > 0 ? props.row.sentRollSort1 : '-' }}
          </div>
          <div v-else-if="col.name === 'sentQuantitySort2'">
            {{ Number(props.row.sentQuantitySort2) > 0 ? `${props.row.sentQuantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'sentRollSort2'">
            {{ Number(props.row.sentRollSort2) > 0 ? props.row.sentRollSort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'dealDate'">
            {{ formatDate(props.row.dealDate).slice(0, 10) }}
          </div>
          <div v-else-if="col.name === 'status'">
            <span class="text-bold" :class="props.row.status === 'expected' ? 'text-warning' : 'text-green'">
              {{ $t('statuses.' + props.row.status) }}
            </span>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <!-- Dialogs -->
  <q-dialog v-model="showCreateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.repaint.barCreate') }}</div>
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
          <selectable-list
            v-model="selectedData.ripeMaterial"
            :label="$t('forms.repaint.fields.ripeMaterial.label')"
            :store="ripeMaterial"
            fetch-method="fetchRipeMaterials"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.repaint.fields.ripeMaterial.validation.required')"
            class="col-12"
          />
          <selectable-list
            v-model="selectedData.paintFabric"
            :label="$t('forms.repaint.fields.paintFabric.label')"
            :store="fabric"
            fetch-method="fetchFabrics"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.repaint.fields.paintFabric.validation.required')"
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.dealDate"
            mask="####-##-##"
            :label="$t('forms.paint.fields.dealDate.label')"
            :rules="[val => val && val.length >= 10 || $t('forms.paint.fields.dealDate.validation.required')]"
            class="col-12"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="selectedData.dealDate"
                    :mask="DATE_FORMAT"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="col-12 q-gutter-sm">
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" :val="1" label="Sort 1" />
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" :val="2" label="Sort 2" />
          </div>
          <q-input
            v-model="selectedData.sentQuantitySort1"
            v-if="selectedData.whichSort === 1"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.repaint.fields.sentQuantitySort1.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.repaint.fields.sentQuantitySort1.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model.number="selectedData.sentRollSort1"
            v-if="selectedData.whichSort === 1"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.repaint.fields.sentRollSort1.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.repaint.fields.sentRollSort1.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model="selectedData.sentQuantitySort2"
            v-if="selectedData.whichSort === 2"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.repaint.fields.sentQuantitySort2.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.repaint.fields.sentQuantitySort2.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model.number="selectedData.sentRollSort2"
            v-if="selectedData.whichSort === 2"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.repaint.fields.sentRollSort2.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.repaint.fields.sentRollSort2.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || paintLoading"
            :loading="loading || paintLoading"
            no-caps
            :label="$t('forms.repaint.buttons.order')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showReceiveModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="receiveAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="receiveActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.repaint.barAccept') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="receiveActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ receiveActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            v-if="Number(selectedData.sentQuantitySort1) > 0"
            v-model="selectedData.receivedQuantitySort1"
            :prefix="`max: ${selectedData.sentQuantitySort1} |`"
            type="number"
            filled
            :label="$t('forms.repaint.fields.receivedQuantitySort1.label')"
            lazy-rules
            :rules="[ val => val && val > 0 && val <= Number(selectedData.sentQuantitySort1) || $t('forms.repaint.fields.receivedQuantitySort1.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-if="Number(selectedData.sentQuantitySort2) > 0"
            v-model="selectedData.receivedQuantitySort2"
            :prefix="`max: ${selectedData.sentQuantitySort2} |`"
            type="number"
            filled
            :label="$t('forms.repaint.fields.receivedQuantitySort2.label')"
            lazy-rules
            :rules="[ val => val && val > 0 && val <= Number(selectedData.sentQuantitySort2) || $t('forms.repaint.fields.receivedQuantitySort2.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-if="Number(selectedData.sentQuantitySort1) > 0"
            v-model.number="selectedData.receivedRollSort1"
            type="number"
            filled
            :label="$t('forms.repaint.fields.receivedRollSort1.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.repaint.fields.receivedRollSort1.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-if="Number(selectedData.sentQuantitySort2) > 0"
            v-model.number="selectedData.receivedRollSort2"
            type="number"
            filled
            :label="$t('forms.repaint.fields.receivedRollSort2.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.repaint.fields.receivedRollSort2.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || paintLoading"
            :loading="loading || paintLoading"
            no-caps
            :label="$t('forms.repaint.buttons.accept')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>
