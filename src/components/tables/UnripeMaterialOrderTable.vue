<script setup>
import { computed, onMounted, ref } from "vue";
import { useUnripeMaterialOrder } from "stores/unripeMaterialOrder.js";
import { useMaterial } from "stores/material.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useThread } from "stores/thread.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import ReportList from "components/ReportList.vue";
import SelectableList from "components/selectableList.vue";

// Props
let props = defineProps({
  orders: {
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
const order = useUnripeMaterialOrder();
const unripeMaterial = useMaterial();
const threads = ref([]);

const selectedData = ref({});
const whichSort = ref(null);
const orderLoading = ref(false);
const threadLoading = ref(false);
const rows = ref([
  { thread: '', quantity: '' }
])

const showOrderCreateModal = ref(false);
const showOrderFinishModal = ref(false);
// const showOrderEditModal = ref(false);
const showOrderDeleteModal = ref(false);
const createOrderErr = ref(null);
// const editOrderErr = ref(null);

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

function getOrders () {
  emit('submit');
}
function getThreads () {
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
  createOrderErr.value = null;
  // editOrderErr.value = null;
}
function createOrderAction() {
  orderLoading.value = true;

  let expectedData = [];

  rows.value.forEach((row) => {
    expectedData.push({thread: row.thread.value, quantity: row.quantity})
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
    .catch((res) => {
      createOrderErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false);
}
function finishOrderAction() {
  if (!selectedData.value.id) {
    console.warn('data is empty');
    return
  }

  orderLoading.value = true;

  order.finishUnripeMaterialOrder(selectedData.value.id)
    .then(() => {
      showOrderFinishModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.unripeMaterialOrder.confirmation.successCompleted')
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
// function editOrderAction() {
//   if (!selectedData.value.id) {
//     console.warn('data is empty');
//     return;
//   }
//
//   orderLoading.value = true;
//
//   let expectedData = [];
//
//   rows.value.forEach((row) => {
//     expectedData.push({thread: row.thread.value, quantity: row.quantity})
//   })
//
//   const input = {
//     quantity: selectedData.value.quantity,
//     material: selectedData.value.material,
//     expectedConsumeDtos: expectedData
//   }
//
//   order.editUnripeMaterialOrder(selectedData.value.id, input)
//     .then(() => {
//       showOrderEditModal.value = false;
//       $q.notify({
//         type: 'positive',
//         position: 'top',
//         timeout: 1000,
//         message: t('forms.unripeMaterialOrder.confirmation.successEdited')
//       })
//       clearAction();
//       getOrders();
//     })
//     .catch((res) => {
//       editOrderErr.value = res.response.data['hydra:description'];
//       $q.notify({
//         type: 'negative',
//         position: 'top',
//         timeout: 1000,
//         message: t('forms.unripeMaterialOrder.confirmation.failure')
//       })
//     })
//     .finally(() => orderLoading.value = false);
// }
function deleteOrderAction() {
  if (!selectedData.value.id) {
    console.warn('data is empty');
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
}
function addRow() {
  rows.value.push({thread: '', quantity: ''});
}
function removeRow(index) {
  if (this.rows.length > 1) {
    this.rows.splice(index, 1);
  }
}
// function prefill() {
//   if ( selectedData?.value?.material['@id'] ) {
//     selectedData.value.material = selectedData.value.material['@id'];
//   }
//
//   let consumes = [];
//   selectedData.value.expectedConsume.forEach((consume) => {
//     const threadOption = threadOptions.value.find(option => option.value === consume.thread);
//
//     if (threadOption) {
//       consumes.push({ thread: threadOption, quantity: consume.quantity });
//     }
//   });
//   rows.value = consumes;
// }
const threadOptions = computed(() => {
  let options = [];
  for (let i in threads.value) {
    options.push({
      label: threads.value[i].name,
      value: threads.value[i]['@id']
    });
  }
  return options
})

const filteredThreadOptions = computed(() => {
  const selectedThreads = rows.value.map(row => row.thread.value);
  return threadOptions.value.filter(option => !selectedThreads.includes(option.value))
});
onMounted(() => {
  getThreads();
})
</script>

<template>
  <skeleton-table
    :loading="props.loading || orderLoading"
  />
  <q-table
    v-show="!props.loading && !orderLoading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :no-data-label="$t('tables.unripeMaterialOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
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
          <div v-if="col.name === 'action'" class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
<!--              <q-btn-->
<!--                size="md" color="primary" rounded dense icon="edit" @click="selectedData = {...props.row}; prefill(); showOrderEditModal = true;"-->
<!--              >-->
<!--                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">-->
<!--                  {{ $t('edit') }}-->
<!--                </q-tooltip>-->
<!--              </q-btn>-->
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
  <q-dialog v-model="showOrderCreateModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createOrderAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createOrderErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.unripeMaterialOrder.barCreate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction"/>
        </div>
        <div v-if="createOrderErr">
          <q-separator color="white"/>
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ createOrderErr }}
          </div>
          <q-separator color="white"/>
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
          {{ $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.title') }}:
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
          <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.unripeMaterialOrder.buttons.create')" type="submit" color="primary"/>
        </div>
        <q-separator/>
      </q-form>
    </div>
  </q-dialog>
<!--  <q-dialog v-model="showOrderEditModal" persistent>-->
<!--    <div-->
<!--      class="bg-white shadow-3"-->
<!--      style="width: 900px; max-width: 80vw;"-->
<!--    >-->
<!--      <q-form @submit.prevent="editOrderAction">-->
<!--        <div-->
<!--          class="q-px-md q-py-sm text-white flex justify-between"-->
<!--          :class="editOrderErr ? 'bg-red' : 'bg-primary q-mb-lg'"-->
<!--        >-->
<!--          <div class="text-h6"> {{ $t('dialogs.unripeMaterialOrder.barEdit') }}</div>-->
<!--          <q-btn icon="close" flat round dense v-close-popup @click="clearAction"/>-->
<!--        </div>-->
<!--        <div v-if="editOrderErr">-->
<!--          <q-separator color="white"/>-->
<!--          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">-->
<!--            <q-icon-->
<!--              class="q-mr-sm"-->
<!--              name="mdi-alert-circle-outline"-->
<!--              size="md"-->
<!--              color="white"-->
<!--            />-->
<!--            {{ editOrderErr }}-->
<!--          </div>-->
<!--          <q-separator color="white"/>-->
<!--        </div>-->
<!--        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">-->
<!--          <q-select-->
<!--            v-model="selectedData.material"-->
<!--            filled-->
<!--            emit-value-->
<!--            map-options-->
<!--            :loading="materialLoading"-->
<!--            :options="materialOptions"-->
<!--            :label="$t('forms.unripeMaterialOrder.fields.material.label')"-->
<!--            option-value="value"-->
<!--            option-label="label"-->
<!--            :rules="[val => !!val || $t('forms.threadPurchase.fields.thread.validation.required')]"-->
<!--            class="col-12"-->
<!--            hide-bottom-space-->
<!--          />-->
<!--          <q-input-->
<!--            filled-->
<!--            type="number"-->
<!--            v-model="selectedData.quantity"-->
<!--            :label="$t('forms.unripeMaterialOrder.fields.quantity.label')"-->
<!--            :rules="[ val => val && val > -1 || $t('forms.unripeMaterialOrder.fields.quantity.validation.required')]"-->
<!--            class="col-12"-->
<!--            hide-bottom-space-->
<!--          />-->
<!--        </div>-->

<!--        <div class="q-pl-md text-subtitle1 text-primary">-->
<!--          {{ $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.title') }}:-->
<!--        </div>-->
<!--        <q-separator class="q-mb-md"/>-->
<!--        <div-->
<!--          v-for="(row, index) in rows" :key="index"-->
<!--          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"-->
<!--        >-->
<!--          <div-->
<!--            v-if="index"-->
<!--            class="flex items-center"-->
<!--          >-->
<!--            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>-->
<!--          </div>-->
<!--          <q-select-->
<!--            v-model="row.thread"-->
<!--            filled-->
<!--            map-options-->
<!--            :loading="threadLoading"-->
<!--            :options="filteredThreadOptions"-->
<!--            :label="$t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.thread.label')"-->
<!--            option-value="value"-->
<!--            option-label="label"-->
<!--            :rules="[val => !!val || $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.thread.validation.required')]"-->
<!--            class="col"-->
<!--            hide-bottom-space-->
<!--          />-->
<!--          <q-input-->
<!--            filled-->
<!--            type="number"-->
<!--            v-model="row.quantity"-->
<!--            :label="$t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.quantity.label')"-->
<!--            :rules="[ val => val && val > -1 || $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.quantity.validation.required')]"-->
<!--            class="col"-->
<!--            hide-bottom-space-->
<!--          />-->
<!--        </div>-->
<!--        <div class="text-right q-ma-md">-->
<!--          <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>-->
<!--        </div>-->
<!--        <q-separator/>-->
<!--        <div class="q-px-md q-py-sm text-center">-->
<!--          <q-btn no-caps :label="$t('forms.unripeMaterialOrder.buttons.edit')" type="submit" color="primary"/>-->
<!--        </div>-->
<!--        <q-separator/>-->
<!--      </q-form>-->
<!--    </div>-->
<!--  </q-dialog>-->
  <q-dialog v-model="showOrderDeleteModal" persistent>
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
        <q-btn :label="$t('dialogs.delete.buttons.cancel')" color="primary" v-close-popup @click="clearAction"/>
        <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteOrderAction"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showOrderFinishModal" persistent>
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.complete.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.complete.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn :label="$t('dialogs.complete.buttons.cancel')" color="grey" v-close-popup @click="clearAction"/>
        <q-btn :label="$t('dialogs.complete.buttons.complete')" color="primary" @click="finishOrderAction"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
