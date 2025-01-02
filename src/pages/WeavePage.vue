<script setup>
import { computed, onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { useCompletedUnripeMaterialOrders } from "stores/completedUnripeMaterialOrders.js";
import { useMaterial } from "stores/material.js";
import { useThread } from "stores/thread.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const { t } = useI18n();
const order = useUnripeMaterialOrder();
const orders = ref([]);
const materials = ref([]);
const threads = ref([]);

const selectedData = ref({});
const tab = ref('orders');
const whichSort = ref(null);
const orderLoading = ref(false);
const materialLoading = ref(false);
const threadLoading = ref(false);

const showOrderCreateModal = ref(false);
const showOrderReportModal = ref(false);
const showOrderDeleteModal = ref(false);

const columns = [
  { name: 'id', label: t('tables.unripeMaterialOrder.columns.id'), align: 'left', field: 'id' },
  { name: 'material', label: t('tables.unripeMaterialOrder.columns.material'), align: 'left', field: 'material' },
  { name: 'quantity', label: t('tables.unripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'completedQuantity', label: t('tables.unripeMaterialOrder.columns.completedQuantity'), align: 'left', field: 'completedQuantity' },
  { name: 'completedQuantitySort2', label: t('tables.unripeMaterialOrder.columns.completedQuantitySort2'), align: 'left', field: 'completedQuantitySort2' },
  { name: 'expectedConsume', label: t('tables.unripeMaterialOrder.columns.expectedConsume'), align: 'left', field: 'expectedConsume' },
  { name: 'consumed', label: t('tables.unripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'createdAt', label: t('tables.unripeMaterialOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'status', label: t('tables.unripeMaterialOrder.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

function getOrders (){
  orderLoading.value = true;
  order.fetchUnripeMaterialOrder('?page=1')
    .then((res) => {
      orders.value = res.data['hydra:member'];
    })
    .finally(() => {
      orderLoading.value = false;
    });
}
function getMaterials (){
  materialLoading.value = true;
  useMaterial().fetchMaterials('')
    .then((res) => {
      materials.value = res.data['hydra:member'];
    })
    .finally(() => {
      materialLoading.value = false;
    });
}
function getThreads (){
  threadLoading.value = true;
  useThread().fetchThreads('')
    .then((res) => {
      threads.value = res.data['hydra:member'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}
function clearAction() {
  selectedData.value = {};
  rows.value = [{ thread: '', quantity: '' }];
  whichSort.value = null;
}
function createOrderAction() {
  orderLoading.value = true;

  let expectedData = [];

  rows.value.forEach((row) => {
    expectedData.push({ thread: row.thread.value, quantity: row.quantity })
  })

  const input = {
    quantity: selectedData.value.quantity,
    material: selectedData.value.material,
    status: 'pending',
    expectedConsumeDtos: expectedData
  }

  order.createUnripeMaterialOrder(input)
    .then(() => {
      showOrderCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successCreated')
      })
      clearAction();
      getOrders();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false);
}
function confirmOrder() {
  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }

  orderLoading.value = true;

  order.confirmUnripeMaterialOrder(selectedData.value.id, { status: 'confirmed' })
    .then(() => {
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successCreated')
      })
      clearAction();
      getOrders();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false);
}
function reportOrderAction() {
  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }

  orderLoading.value = true;

  let consumed = [];

  rows.value.forEach((consume) => {
    consumed.push({ thread: consume.thread, quantity: consume.quantity })
  })

  let input  = {
    unripeMaterialOrder: selectedData.value['@id'],
    consumedDtos: consumed
  }

  if ( whichSort.value.value === 1 ) {
    input.quantity = String(selectedData.value.completedOrderQuantity);
    input.roll = selectedData.value.completedOrderRoll;
    input.quantitySort2 = '0';
    input.rollSort2 = 0;
  } else if ( whichSort.value.value === 2 ) {
    input.quantity = '0';
    input.roll = 0;
    input.quantitySort2 = String(selectedData.value.completedOrderQuantity);
    input.rollSort2 = selectedData.value.completedOrderRoll;
  }

  useCompletedUnripeMaterialOrders().createCompletedUnripeMaterialOrders(input)
    .then(() => {
      showOrderCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successCreated')
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false);
}
function prefilling() {
  if ( selectedData?.value?.material['@id'] ) {
    selectedData.value.material = selectedData.value.material['@id'];
  }

  let consumes = [];
  selectedData.value.expectedConsume.forEach((consume) => {
    consumes.push({ thread: consume.thread, quantity: 0 })
  })
  rows.value = consumes;
}
function deleteOrderAction() {
  if (selectedData.value.id) {
    if (selectedData.value.status === 'confirmed' || selectedData.value.status === 'completed') {
      return;
    }
    orderLoading.value = true;

    order.deleteUnripeMaterialOrder(selectedData.value.id)
      .then(() => {
        showOrderDeleteModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterialOrder.confirmation.successDeleted')
        });
        clearAction();
        getOrders()
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.unripeMaterialOrder.confirmation.failure')
        })
      })
      .finally(() => orderLoading.value = false)
  } else {
    console.warn('data is empty');
  }
}

const materialOptions = computed(() => {
  let options = [];
  for ( let i in materials.value ) {
    options.push( {
      label: materials.value[i].name,
      value: materials.value[i]['@id']
    } );
  }
  return options
})

const threadOptions = computed(() => {
  let options = [];
  for ( let i in threads.value ) {
    options.push( {
      label: threads.value[i].name,
      value: threads.value[i]['@id']
    } );
  }
  return options
})

const filteredThreadOptions = computed(() => {
  const selectedThreads = rows.value.map(row => row.thread.value);
  return threadOptions.value.filter(option => !selectedThreads.includes(option.value))
});

const rows = ref([
  { thread: '', quantity: '' }
])

function addRow() {
  rows.value.push({ thread: '', quantity: '' });
}

function removeRow(index) {
  if (this.rows.length > 1) {
    this.rows.splice(index, 1);
  }
}

onMounted(() => {
  getOrders();
  getMaterials();
  getThreads();
})
</script>

<template>
  <div class="q-mx-md q-mt-md flex">
    <q-tabs
      v-model="tab"
      no-caps
      dense
      outside-arrows
      mobile-arrows
      class="shadow-2 text-primary"
      :class="$q.screen.xs ? 'full-width' : ''"
    >
      <q-tab name="orders" :label="$t('orders')"/>
    </q-tabs>
  </div>

  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="orders">
        <q-table
          flat
          bordered
          :rows="orders"
          :columns="columns"
          :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
          :loading="orderLoading"
          color="primary"
          row-key="id"
          hide-bottom
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top>
            <div class="col-12 flex justify-between">
              <div class="q-table__title">{{ $t('tables.unripeMaterialOrder.header.title') }}</div>
              <div class="text-right">
                <q-btn
                  color="primary"
                  icon-right="add"
                  :label="$t('tables.unripeMaterialOrder.buttons.add')"
                  no-caps
                  @click="showOrderCreateModal = true"
                />
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in columns" :key="col.name" :props="props">
                <div class="flex justify-end" v-if="col.name === 'action'">
                  <div class="flex no-wrap q-gutter-x-sm">
                    <q-btn
                      v-if="props.row.status === 'pending'"
                      size="md" color="green" rounded dense icon="mdi-check-outline" @click="selectedData = props.row; confirmOrder()"
                    >
                      <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                        {{ $t('confirm') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.status === 'confirmed'"
                      dense
                      no-caps
                      no-wrap
                      size="md"
                      color="green"
                      :label="$t('report')"
                      @click="selectedData = props.row; prefilling(); showOrderReportModal = true;"
                    />
                    <q-btn
                      v-if="props.row.status === 'pending'"
                      size="md" color="red" rounded dense icon="delete" @click="showOrderDeleteModal = true; selectedData = props.row"
                    >
                      <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                        {{ $t('delete') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
                <div v-else-if="col.name === 'material'">
                  {{ props.row?.material?.name || '-' }}
                </div>
                <div v-else-if="col.name === 'expectedConsume'">
                  <span
                    v-for="consume in props.row.expectedConsume"
                    :key="consume"
                    class="q-mr-sm"
                  >
                    {{ consume.thread }}: {{ consume.quantity }}
                  </span>
                </div>
                <div v-else-if="col.name === 'consumed'">
                  <span
                    v-for="consume in props.row.consumed"
                    :key="consume"
                    class="q-mr-sm"
                  >
                    {{ consume.thread }}: {{ consume.quantity }}
                  </span>
                </div>
                <div v-else-if="col.name === 'status'">
                  <span :class="props.row.status === 'completed' ? 'text-green' : ''">
                    {{ props.row.status }}
                  </span>
                </div>
                <div v-else>
                  {{ props.row[col.field] || '-' }}
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <!-- Dialogs -->
        <q-dialog v-model="showOrderCreateModal" persistent>
          <div
            class="bg-white shadow-3"
            style="width: 900px; max-width: 80vw;"
          >
            <q-form @submit.prevent="createOrderAction">
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.unripeMaterialOrder.barCreate') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
              </div>
              <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
                <q-select
                  v-model="selectedData.material"
                  filled
                  emit-value
                  map-options
                  :loading="materialLoading"
                  :options="materialOptions"
                  :label="$t('forms.unripeMaterialOrder.fields.material.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.threadPurchase.fields.thread.validation.required')]"
                  class="col-12"
                  hide-bottom-space
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
                {{ $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.title') }}:
              </div>
              <q-separator class="q-mb-md" />
              <div
                v-for="(row, index) in rows" :key="index"
                class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
              >
                <div
                  v-if="index"
                  class="flex items-center"
                >
                  <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense />
                </div>
                <q-select
                  v-model="row.thread"
                  filled
                  map-options
                  :loading="threadLoading"
                  :options="filteredThreadOptions"
                  :label="$t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.thread.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.thread.validation.required')]"
                  class="col"
                  hide-bottom-space
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
                <q-btn icon="mdi-plus" rounded color="green" @click="addRow" />
              </div>
              <q-separator />
              <div class="q-px-md q-py-sm text-center">
                <q-btn no-caps :label="$t('forms.unripeMaterialOrder.buttons.create')" type="submit" color="primary" />
              </div>
              <q-separator />
            </q-form>
          </div>
        </q-dialog>
        <q-dialog v-model="showOrderReportModal" persistent>
          <div
            class="bg-white shadow-3"
            style="width: 900px; max-width: 80vw;"
          >
            <q-form @submit.prevent="reportOrderAction">
              <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
                <div class="text-h6"> {{ $t('dialogs.completedMaterialOrderReport.barCreate') }} </div>
                <q-btn icon="close" flat round dense v-close-popup @click="clearAction()" />
              </div>

              <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
                <q-select
                  v-model="whichSort"
                  filled
                  map-options
                  :options="[{ label: 'Sort-1', value: 1 }, { label: 'Sort-2', value: 2 }]"
                  :label="$t('forms.completedMaterialOrderReport.fields.sort.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.completedMaterialOrderReport.fields.sort.validation.required')]"
                  class="col-12"
                  hide-bottom-space
                />

                <q-input
                  v-model="selectedData.completedOrderQuantity"
                  :prefix="`${selectedData.quantity} ${ $t('from') }:`"
                  :disable="!whichSort"
                  filled
                  type="number"
                  :label="$t('forms.completedMaterialOrderReport.fields.quantity.label')"
                  :rules="[ val => val && val > 0 || $t('forms.completedMaterialOrderReport.fields.quantity.validation.required')]"
                  class="col-6"
                  hide-bottom-space
                />

                <q-input
                  v-model.number="selectedData.completedOrderRoll"
                  :disable="!selectedData.completedOrderQuantity"
                  filled
                  type="number"
                  :label="$t('forms.completedMaterialOrderReport.fields.roll.label')"
                  :rules="[ val => val && val > -1 || $t('forms.completedMaterialOrderReport.fields.roll.validation.required')]"
                  class="col-6"
                  hide-bottom-space
                />
              </div>
              <div class="q-pl-md text-subtitle1 text-primary">
                {{ $t('forms.completedMaterialOrderReport.fields.consumedDtos.title') }}:
              </div>
              <q-separator class="q-mb-md" />
              <div
                v-for="(row, index) in rows" :key="index"
                class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
              >
                <q-select
                  v-model="row.thread"
                  :disable="true"
                  filled
                  map-options
                  :loading="threadLoading"
                  :options="filteredThreadOptions"
                  :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.thread.label')"
                  option-value="value"
                  option-label="label"
                  :rules="[val => !!val || $t('forms.completedMaterialOrderReport.fields.consumedDtos.thread.validation.required')]"
                  class="col"
                  hide-bottom-space
                />
                <q-input
                  filled
                  type="number"
                  v-model="row.quantity"
                  :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
                  :rules="[ val => val && val > 0 || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
                  class="col"
                  hide-bottom-space
                />
              </div>
              <q-separator />
              <div class="q-px-md q-py-sm text-center">
                <q-btn no-caps :label="$t('forms.completedMaterialOrderReport.buttons.create')" type="submit" color="primary" />
              </div>
              <q-separator />
            </q-form>
          </div>
        </q-dialog>
        <q-dialog v-model="showOrderDeleteModal" persistent>
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
              <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteOrderAction" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
