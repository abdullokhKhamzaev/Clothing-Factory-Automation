<script setup>
import {onMounted, ref} from "vue";
import { useProductModelOrder } from "stores/productModelOrder.js";
import { useProductModels } from "stores/productModel.js";
import { useCutterRipeMaterialWarehouse } from "stores/cutterRipeMaterialWarehouse.js";
import { useAbout } from "stores/user/about.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import CutReportList from "components/CutReportList.vue";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const user = useAbout();
const model = useProductModels();
const cutterWarehouse = useCutterRipeMaterialWarehouse();

const selectedData = ref({});
const whichSort = ref(null);
const orderLoading = ref(false);
const rows = ref([
  { size: '', quantity: '' }
])

const expectedConsumeRows = ref([
  { cutterRipeMaterialWarehouse: '', quantity: '', quantitySort2: '', remainingSort1: '', remainingSort2: '' }
]);
function addRow() {
  expectedConsumeRows.value.push({ cutterRipeMaterialWarehouse: '', quantity: '', quantitySort2: '', remainingSort1: '', remainingSort2: '' });
}
function removeRow(index) {
  if (this.expectedConsumeRows.length > 1) {
    this.expectedConsumeRows.splice(index, 1);
  }
}

const showOrderCreateModal = ref(false);
const showOrderUpdateModal = ref(false);
const showOrderFinishModal = ref(false);
const createOrderErr = ref(null);
const updateOrderErr = ref(false);

const columns = [
  { name: 'id', label: '#ID', align: 'left', field: 'id' },
  { name: 'productModel', label: t('tables.modelOrder.columns.productModel'), align: 'left', field: 'productModel' },
  { name: 'createdAt', label: t('tables.modelOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.modelOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'productSize', label: t('tables.modelOrder.columns.productSize'), align: 'left', field: 'productSize' },
  { name: 'expectedOutlayRipeMaterial', label: t('tables.modelOrder.columns.expectedOutlayRipeMaterial'), align: 'left', field: 'expectedOutlayRipeMaterial' },
  { name: 'productModelOrderCompleteds', label: t('tables.modelOrder.columns.productModelOrderCompleteds'), align: 'left', field: 'productModelOrderCompleteds' },
  { name: 'status', label: t('tables.modelOrder.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useProductModelOrder();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  statuses: ['pending', 'confirmed']
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchOrders({...pagination.value, ...filters.value})
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

function prefill() {
  let sizes = [];
  selectedData.value.productModel.sizes.forEach((size) => {
    sizes.push({ size: size.size, quantity: '' });
  });
  rows.value = sizes;
}
function prefillForUpdate() {
  selectedData.value.productModel = {value: selectedData.value.productModel['@id'], label: selectedData.value.productModel.name};

  let sizes = [];
  selectedData.value.productSize.forEach((size) => {
    sizes.push({ size: size.size, quantity: size.quantity });
  });
  rows.value = sizes;

  let consumes = [];
  selectedData.value.expectedOutlayRipeMaterial.forEach((consume) => {
    consumes.push({
      cutterRipeMaterialWarehouse: { value: consume.cutterRipeMaterialWarehouse['@id'], label: consume.cutterRipeMaterialWarehouse.ripeMaterial.name },
      quantity: consume.quantity,
      quantitySort2: consume.quantitySort2,
      remainingSort1: consume.remainingSort1,
      remainingSort2: consume.remainingSort2,
    });
  });
  expectedConsumeRows.value = consumes;
}
function clearAction () {
  selectedData.value = {};
  expectedConsumeRows.value = [{ cutterRipeMaterialWarehouse: '', quantity: '', quantitySort2: '', remainingSort1: '', remainingSort2: '' }];
  rows.value = [{ size: '', quantity: '' }];
  whichSort.value = null;
  createOrderErr.value = null;
  updateOrderErr.value = null;
}
function createOrderAction () {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }
  orderLoading.value = true;

  let productSize = [];

  rows.value.forEach((row) => {
    productSize.push({size: row.size, quantity: row.quantity})
  })

  let expectedConsume = [];

  expectedConsumeRows.value.forEach((row) => {
    expectedConsume.push({
      cutterRipeMaterialWarehouse: row.cutterRipeMaterialWarehouse['@id'],
      quantity: row.quantity || '0',
      quantitySort2: row.quantitySort2 || '0',
      remainingSort1: row.remainingSort1 || '0',
      remainingSort2: row.remainingSort2 || '0'
    })
  })

  const input = {
    productModel: selectedData.value.productModel['@id'],
    productSize: productSize,
    expectedOutlayRipeMaterial: expectedConsume,
    createdBy: user.about['@id']
  }

  repository.createOrder(input)
    .then(() => {
      showOrderCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      createOrderErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}
function updateOrderAction () {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }
  orderLoading.value = true;

  let productSize = [];

  rows.value.forEach((row) => {
    productSize.push({size: row.size, quantity: row.quantity})
  })

  let expectedConsume = [];

  expectedConsumeRows.value.forEach((row) => {
    expectedConsume.push({
      cutterRipeMaterialWarehouse: row?.cutterRipeMaterialWarehouse['@id'] || row.cutterRipeMaterialWarehouse.value,
      quantity: row.quantity || '0',
      quantitySort2: row.quantitySort2 || '0',
      remainingSort1: row.remainingSort1 || '0',
      remainingSort2: row.remainingSort2 || '0'
    })
  })

  const input = {
    productModel: selectedData?.value?.productModel['@id'] || selectedData.value.productModel.value,
    productSize: productSize,
    expectedOutlayRipeMaterial: expectedConsume,
    createdBy: user.about['@id']
  }

  repository.updateOrder(selectedData.value.id, input)
    .then(() => {
      showOrderUpdateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.successEdited')
      })
      clearAction();
    })
    .catch((res) => {
      updateOrderErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.failure')
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

  repository.complete(selectedData.value.id)
    .then(() => {
      showOrderFinishModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.successCompleted')
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.transaction.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.modelOrder.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.modelOrder.buttons.add')"
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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
          <div v-if="col.name === 'action'" class="flex justify-end">
            <q-btn
              color="primary"
              icon="mdi-dots-vertical"
              size="sm"
              round
            >
              <q-menu>
                <q-card>
                  <q-item
                    v-if="props.row.status === 'confirmed'"
                    v-close-popup
                    class="text-green"
                    clickable
                    @click="showOrderFinishModal = true; selectedData = {...props.row}"
                  >
                    <q-item-section avatar class="q-pr-md" style="min-width: auto">
                      <q-avatar
                        icon="mdi-check-bold"
                        color="green"
                        class="text-white"
                        size="md"
                      />
                    </q-item-section>
                    <q-item-section>
                      {{ $t('finish') }}
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="props.row.status === 'pending'"
                    v-close-popup
                    class="text-primary"
                    clickable
                    @click="selectedData = {...props.row}; prefillForUpdate(); showOrderUpdateModal = true"
                  >
                    <q-item-section avatar class="q-pr-md" style="min-width: auto">
                      <q-avatar
                        icon="mdi-pencil-outline"
                        color="primary"
                        class="text-white"
                        size="md"
                      />
                    </q-item-section>
                    <q-item-section>
                      {{ $t('edit') }}
                    </q-item-section>
                  </q-item>
                </q-card>
              </q-menu>
            </q-btn>
          </div>
          <div v-else-if="col.name === 'productModel'">
            {{ props.row?.productModel?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'expectedOutlayRipeMaterial'">
            <div
              v-for="consume in props.row.expectedOutlayRipeMaterial"
              :key="consume"
            >
              <div>{{ consume.cutterRipeMaterialWarehouse.ripeMaterial.name }} {{ Number(consume.quantity) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}</div>
              <div v-if="Number(consume.quantitySort2)">{{$t('forms.modelOrder.fields.expectedConsumeQuantitySort2.label')}}: {{ Number(consume.quantitySort2) }}</div>
              <div v-if="Number(consume.remainingSort1)">{{$t('forms.modelOrder.fields.expectedConsumeRemainingSort1.label')}}: {{ Number(consume.remainingSort1) }}</div>
              <div v-if="Number(consume.remainingSort2)">{{$t('forms.modelOrder.fields.expectedConsumeRemainingSort2.label')}}: {{ Number(consume.remainingSort2) }}</div>
            </div>
          </div>
          <div v-else-if="col.name === 'productSize'">
            <div
              v-for="consume in props.row.productSize"
              :key="consume"
            >
              {{ consume.size }} : {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'productModelOrderCompleteds'">
            <q-toggle
              v-if="props.row?.productModelOrderCompleteds.length"
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
          <div v-else-if="col.name === 'status'" :class="props.row.status === 'pending' ? 'text-red' : 'text-orange'">
            {{ $t('statuses.' + props.row.status) }}
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <cut-report-list :lists="props.row?.productModelOrderCompleteds" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showOrderCreateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createOrderAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createOrderErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.modelOrder.barCreate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
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
            v-model="selectedData.productModel"
            :label="$t('forms.modelOrder.fields.productModel.label')"
            :store="model"
            fetch-method="fetchProductModels"
            item-label="name"
            :rule-message="$t('forms.modelOrder.fields.productModel.validation.required')"
            @update:model-value="prefill"
            clearable
            class="col-12"
          />
          <div
            v-for="(row, index) in rows" :key="index"
            :class="selectedData.productModel ? 'col-12' : 'hidden'"
          >
            <div class="row q-col-gutter-x-lg">
              <q-input
                filled
                disable
                v-model="row.size"
                :label="$t('forms.modelOrder.fields.size.label')"
                :rules="[ val => val && val > -1 || $t('forms.modelOrder.fields.size.validation.required')]"
                class="col-12 col-md-6"
                hide-bottom-space
              />
              <q-input
                filled
                type="number"
                v-model.number="row.quantity"
                :label="$t('forms.modelOrder.fields.quantity.label')"
                :rules="[ val => val && val > -1 || $t('forms.modelOrder.fields.quantity.validation.required')]"
                class="col-12 col-md-6"
                hide-bottom-space
              />
            </div>
          </div>
        </div>

        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.modelOrder.fields.expectedOutlayRipeMaterial.title') }}
        </div>

        <div
          v-for="(row, index) in expectedConsumeRows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <div
            v-if="index"
            class="flex items-center"
          >
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <selectable-list
            v-model="row.cutterRipeMaterialWarehouse"
            :label="$t('forms.modelOrder.fields.cutterRipeMaterialWarehouse.label')"
            :store="cutterWarehouse"
            fetch-method="list"
            :item-label="{ label: 'ripeMaterial', path: 'name' }"
            :rule-message="$t('forms.modelOrder.fields.productModel.validation.required')"
            clearable
            class="col-12"
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantity) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.quantity} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            v-model="row.quantity"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.expectedConsumeQuantity.label')"
            :rules="[ val => val && val > -1 && val <= Number(row.cutterRipeMaterialWarehouse.quantity) || $t('forms.modelOrder.fields.expectedConsumeQuantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantitySort2) > 0"
            filled
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.quantitySort2} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            type="number"
            v-model="row.quantitySort2"
            :label="$t('forms.modelOrder.fields.expectedConsumeQuantitySort2.label')"
            :rules="[ val => val && val > -1 && val <= Number(row.cutterRipeMaterialWarehouse.quantitySort2) || $t('forms.modelOrder.fields.expectedConsumeQuantitySort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort1) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.remainingSort1} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            filled
            type="number"
            v-model="row.remainingSort1"
            :label="$t('forms.modelOrder.fields.expectedConsumeRemainingSort1.label')"
            :rules="[ val => val && val > -1 && val <= Number(row.cutterRipeMaterialWarehouse.remainingSort1) || $t('forms.modelOrder.fields.expectedConsumeRemainingSort1.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort2) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.remainingSort2} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            filled
            type="number"
            v-model="row.remainingSort2"
            :label="$t('forms.modelOrder.fields.expectedConsumeRemainingSort2.label')"
            :rules="[ val => val && val > -1 && val <= Number(row.cutterRipeMaterialWarehouse.remainingSort2) || $t('forms.modelOrder.fields.expectedConsumeRemainingSort2.validation.required')]"
            class="col-12 col-md-6"
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
            :label="$t('forms.modelOrder.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator/>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showOrderUpdateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateOrderAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateOrderErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.modelOrder.barEdit') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="updateOrderErr">
          <q-separator color="white"/>
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ updateOrderErr }}
          </div>
          <q-separator color="white"/>
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <selectable-list
            v-model="selectedData.productModel"
            :label="$t('forms.modelOrder.fields.productModel.label')"
            :store="model"
            fetch-method="fetchProductModels"
            item-label="name"
            :rule-message="$t('forms.modelOrder.fields.productModel.validation.required')"
            @update:model-value="prefill"
            clearable
            class="col-12"
          />
          <div
            v-for="(row, index) in rows" :key="index"
            :class="selectedData.productModel ? 'col-12' : 'hidden'"
          >
            <div class="row q-col-gutter-x-lg">
              <q-input
                filled
                disable
                v-model="row.size"
                :label="$t('forms.modelOrder.fields.size.label')"
                :rules="[ val => val && val > -1 || $t('forms.modelOrder.fields.size.validation.required')]"
                class="col-12 col-md-6"
                hide-bottom-space
              />
              <q-input
                filled
                type="number"
                v-model.number="row.quantity"
                :label="$t('forms.modelOrder.fields.quantity.label')"
                :rules="[ val => val && val > -1 || $t('forms.modelOrder.fields.quantity.validation.required')]"
                class="col-12 col-md-6"
                hide-bottom-space
              />
            </div>
          </div>
        </div>

        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.modelOrder.fields.expectedOutlayRipeMaterial.title') }}
        </div>

        <div
          v-for="(row, index) in expectedConsumeRows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <div
            v-if="index"
            class="flex items-center"
          >
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <selectable-list
            v-model="row.cutterRipeMaterialWarehouse"
            :label="$t('forms.modelOrder.fields.cutterRipeMaterialWarehouse.label')"
            :store="cutterWarehouse"
            fetch-method="list"
            :item-label="{ label: 'ripeMaterial', path: 'name' }"
            :rule-message="$t('forms.modelOrder.fields.productModel.validation.required')"
            clearable
            class="col-12"
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantity) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.quantity} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            v-model="row.quantity"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.expectedConsumeQuantity.label')"
            :rules="[ val => val && val > -1 && val <= row.cutterRipeMaterialWarehouse.quantity || $t('forms.modelOrder.fields.expectedConsumeQuantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantitySort2) > 0"
            filled
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.quantitySort2} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            type="number"
            v-model="row.quantitySort2"
            :label="$t('forms.modelOrder.fields.expectedConsumeQuantitySort2.label')"
            :rules="[ val => val && val > -1 && val <= row.cutterRipeMaterialWarehouse.quantitySort2 || $t('forms.modelOrder.fields.expectedConsumeQuantitySort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort1) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.remainingSort1} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            filled
            type="number"
            v-model="row.remainingSort1"
            :label="$t('forms.modelOrder.fields.expectedConsumeRemainingSort1.label')"
            :rules="[ val => val && val > -1 && val <= row.cutterRipeMaterialWarehouse.remainingSort1 || $t('forms.modelOrder.fields.expectedConsumeRemainingSort1.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort2) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.remainingSort2} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            filled
            type="number"
            v-model="row.remainingSort2"
            :label="$t('forms.modelOrder.fields.expectedConsumeRemainingSort2.label')"
            :rules="[ val => val && val > -1 && val <= row.cutterRipeMaterialWarehouse.remainingSort2 || $t('forms.modelOrder.fields.expectedConsumeRemainingSort2.validation.required')]"
            class="col-12 col-md-6"
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
            :label="$t('forms.modelOrder.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator/>
      </q-form>
    </div>
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
