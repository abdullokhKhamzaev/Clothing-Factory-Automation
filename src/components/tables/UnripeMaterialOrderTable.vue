<script setup>
import { onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { useMaterial } from "stores/material.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useThread } from "stores/thread.js";
import { formatDate, isToday } from "../../libraries/constants/defaults.js";
import ReportList from "components/ReportList.vue";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const thread = useThread();
const unripeMaterial = useMaterial();

const selectedData = ref({});
const whichSort = ref(null);
const orderLoading = ref(false);
const rows = ref([
  { thread: '', quantity: '' }
])

const showOrderCreateModal = ref(false);
const showOrderFinishModal = ref(false);
const showOrderDeleteModal = ref(false);
const createOrderErr = ref(null);

const columns = [
  { name: 'id', label: t('tables.unripeMaterialOrder.columns.id'), align: 'left', field: 'id' },
  { name: 'material', label: t('tables.unripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'createdAt', label: t('tables.unripeMaterialOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'status', label: t('tables.unripeMaterialOrder.columns.status'), align: 'left', field: 'status' },
  { name: 'createdBy', label: t('tables.unripeMaterialOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'quantity', label: t('tables.unripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'completedQuantitySort2', label: t('tables.unripeMaterialOrder.columns.completedQuantitySort2'), align: 'left', field: 'completedQuantitySort2' },
  { name: 'completedRoll', label: t('tables.unripeMaterialOrder.columns.completedRoll'), align: 'left', field: 'completedRoll' },
  { name: 'completedRollSort2', label: t('tables.unripeMaterialOrder.columns.completedRollSort2'), align: 'left', field: 'completedRollSort2' },
  { name: 'completedQuantity', label: t('tables.unripeMaterialOrder.columns.completedQuantity'), align: 'left', field: 'completedQuantity' },
  { name: 'expectedConsume', label: t('tables.unripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.unripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'completedUnripeMaterialOrders', label: t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders'), align: 'left', field: 'completedUnripeMaterialOrders' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useUnripeMaterialOrder();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  statuses: ['confirmed', 'pending']
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchUnripeMaterialOrder({...pagination.value, ...filters.value})
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
  rows.value = [{ thread: '', quantity: '' }];
  whichSort.value = null;
  createOrderErr.value = null;
}
function createOrderAction() {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  orderLoading.value = true;

  let expectedData = [];

  rows.value.forEach((row) => {
    expectedData.push({thread: row.thread, quantity: row.quantity})
  })

  const input = {
    quantity: selectedData.value.quantity,
    material: selectedData.value.material,
    status: 'pending',
    expectedConsumeDtos: expectedData
  }

  repository.createUnripeMaterialOrder(input)
    .then(() => {
      showOrderCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createOrderErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}
function finishOrderAction() {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('data is empty');
    return
  }

  orderLoading.value = true;

  repository.finishUnripeMaterialOrder(selectedData.value.id)
    .then(() => {
      showOrderFinishModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successCompleted')
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}
function deleteOrderAction() {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }
  orderLoading.value = true;
  repository.deleteUnripeMaterialOrder(selectedData.value.id)
    .then(() => {
      showOrderDeleteModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successDeleted')
      });
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    })
}
function addRow() {
  rows.value.push({thread: '', quantity: ''});
}
function removeRow(index) {
  if (this.rows.length > 1) {
    this.rows.splice(index, 1);
  }
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.unripeMaterialOrder.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.unripeMaterialOrder.buttons.add')"
            no-caps
            class="q-mb-md q-mb-sm-none"
            @click="showOrderCreateModal = true"
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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green'">
          <div v-if="col.name === 'action'" class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                v-if="props.row.status === 'pending'"
                size="md" color="red" rounded dense icon="delete" @click="showOrderDeleteModal = true; selectedData = {...props.row}"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('delete') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status === 'confirmed'"
                dense
                no-caps
                :label="$t('finish')"
                size="md"
                color="primary"
                @click="showOrderFinishModal = true; selectedData = {...props.row}"
              />
            </div>
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'material'">
            {{ props.row?.material?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'expectedConsume'">
            <div
              v-for="consume in props.row.expectedConsume"
              :key="consume"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </div>
          </div>
          <div v-else-if="col.name === 'consumed'">
            <div
              v-for="consume in props.row.consumed"
              :key="consume"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
            </div>
          </div>
          <div v-else-if="col.name === 'completedUnripeMaterialOrders'">
            <q-toggle
              v-if="props.row?.completedUnripeMaterialOrders.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.unripeMaterialOrder.columns.completedUnripeMaterialOrders')"
            />
            <span v-else>
              -
            </span>
          </div>
          <div v-else-if="col.name === 'status'" class="text-orange">
            {{ $t('statuses.' + props.row.status) }}
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <report-list :lists="props.row.completedUnripeMaterialOrders" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showOrderCreateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createOrderAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createOrderErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.unripeMaterialOrder.barCreate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="createOrderErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ createOrderErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <selectable-list
            v-model="selectedData.material"
            :label="$t('forms.unripeMaterialOrder.fields.material.label')"
            :store="unripeMaterial"
            fetch-method="fetchMaterials"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.threadPurchase.fields.thread.validation.required')"
            class="col-12"
          />
          <q-input
            filled
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.unripeMaterialOrder.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterialOrder.fields.quantity.validation.required')]"
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
          <div
            v-if="index"
            class="flex items-center"
          >
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <selectable-list
            v-model="row.thread"
            :label="$t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.thread.label')"
            :store="thread"
            fetch-method="fetchThreads"
            item-value="@id"
            item-label="name"
            :rules="[val => !!val || $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.thread.validation.required')]"
            class="col"
          />
          <q-input
            filled
            type="number"
            v-model="row.quantity"
            :label="$t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.quantity.validation.required')]"
            class="col"
            hide-bottom-space
          />
        </div>
        <div class="text-right q-ma-md">
          <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || orderLoading"
            :loading="loading || orderLoading"
            no-caps
            :label="$t('forms.unripeMaterialOrder.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator/>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showOrderDeleteModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row flex items-center q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.delete.bar') }}</div>
        <q-space/>
        <q-icon name="delete" color="grey" size="sm"/>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.delete.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn :label="$t('dialogs.delete.buttons.cancel')" color="primary" v-close-popup />
        <q-btn
          :disable="loading || orderLoading"
          :loading="loading || orderLoading"
          :label="$t('dialogs.delete.buttons.confirm')"
          color="red"
          @click="deleteOrderAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showOrderFinishModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.complete.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.complete.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn :label="$t('dialogs.complete.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || orderLoading"
          :loading="loading || orderLoading"
          :label="$t('dialogs.complete.buttons.complete')"
          color="primary"
          @click="finishOrderAction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
