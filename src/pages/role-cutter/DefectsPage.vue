<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { useProductModelOrderCompleted } from "stores/productModelOrderCompleted.js";
import { useCutterRipeMaterialWarehouse } from "stores/cutterRipeMaterialWarehouse.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const user = useAbout();
const cutterWarehouse = useCutterRipeMaterialWarehouse();
const { t } = useI18n();
const $q = useQuasar();
const selectedData = ref({});
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
const showOrderReportModal = ref(false);
const reportActionErr = ref(false);

const warehouse = ref([]);
const warehouseActions = ref([]);
const warehouseActionTotal = ref(0);
const warehouseActionLoading = ref(false);
const warehouseActionPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const warehouseActionPagesNumber = computed(() => Math.ceil(warehouseActionTotal.value / warehouseActionPagination.value.rowsPerPage));

const loading = ref(false);
const rows = ref([{ size: '', quantity: '', max: '' }]);
const consumedRows = ref([
  {
    cutterRipeMaterialWarehouse: '',
    quantity: '',
    quantitySort2: '',
    remainingSort1: '',
    remainingSort2: '',
    newRemainingSort1: '',
    newRemainingSort2: '',
    wasteSort1: '',
    wasteSort2: '',
    wasteRemainingSort1: '',
    wasteRemainingSort2: ''
  }
]);
function addRow() {
  consumedRows.value.push({
    cutterRipeMaterialWarehouse: '',
    quantity: '',
    quantitySort2: '',
    remainingSort1: '',
    remainingSort2: '',
    newRemainingSort1: '',
    newRemainingSort2: '',
    wasteSort1: '',
    wasteSort2: '',
    wasteRemainingSort1: '',
    wasteRemainingSort2: ''
  });
}
function removeRow(index) {
  if (this.consumedRows.length > 1) {
    this.consumedRows.splice(index, 1);
  }
}
const columns = [
  { name: 'id', label: t('tables.warehouseAction.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.warehouseAction.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'sentBy', label: t('tables.warehouseAction.columns.sentBy'), align: 'left', field: 'sentBy' },
  { name: 'productModel', label: t('tables.warehouseAction.columns.productModel'), align: 'left', field: 'productModel' },
  { name: 'productSize', label: t('tables.warehouseAction.columns.productSize'), align: 'left', field: 'productSize' },
  { name: 'fromWarehouse', label: t('tables.warehouseAction.columns.fromWarehouse'), align: 'left', field: 'fromWarehouse' },
  { name: 'toWarehouse', label: t('tables.warehouseAction.columns.toWarehouse'), align: 'left', field: 'toWarehouse' },
  { name: 'status', label: t('tables.warehouseAction.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

function acceptAction () {
  warehouseActionLoading.value = true;
  useProductWarehouse().accept(selectedData.value.id, {status: 'accepted'})
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
      refresh();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => warehouseActionLoading.value = false)
}
function rejectAction () {
  warehouseActionLoading.value = true;
  useProductWarehouse().reject(selectedData.value.id, {status: 'rejected'})
    .then(() => {
      showRejectModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successRejected')
      })
      clearAction();
      refresh();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => warehouseActionLoading.value = false)
}
function getWarehouse (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  props.name = 'cutterDefectiveWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
      loading.value = false;
    })
    .then(getWarehouseAction)
}
function getWarehouseAction (filterProps) {
  let props = filterProps || {};

  warehouseActionLoading.value = true;

  props.toWarehouse = warehouse.value['@id'];

  useProductWarehouse().getAll(props || '')
    .then((res) => {
      warehouseActions.value = res.data['hydra:member'];
      warehouseActionTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      warehouseActionLoading.value = false;
    });
}
function reportOrderAction() {
  if (!selectedData.value.productModel['@id']) {
    console.warn('data is empty');
    return;
  }

  loading.value = true;

  let productSize = [];

  rows.value.forEach((product) => {
    productSize.push({ size: product.size, quantity: product.quantity })
  })

  let consumedMaterials = [];

  consumedRows.value.forEach((row) => {
    consumedMaterials.push({
      cutterRipeMaterialWarehouse: row.cutterRipeMaterialWarehouse['@id'],
      quantity: String(row.quantity) || '0',
      quantitySort2: String(row.quantitySort2) || '0',
      remainingSort1: String(row.remainingSort1) || '0',
      remainingSort2: String(row.remainingSort2) || '0',
      newRemainingSort1: String(row.newRemainingSort1) || '0',
      newRemainingSort2: String(row.newRemainingSort2) || '0',
      wasteSort1: String(row.wasteSort1) || '0',
      wasteSort2: String(row.wasteSort2) || '0',
      wasteRemainingSort1: String(row.wasteRemainingSort1) || '0',
      wasteRemainingSort2: String(row.wasteRemainingSort2) || '0',
    })
  })

  let input  = {
    // productModelOrder: selectedData.value['@id'],
    productModel: selectedData.value.productModel['@id'],
    productSize: productSize,
    outlayRipeMaterial: consumedMaterials,
    createdBy: user.about['@id'],
    isDefective: true
  }

  useProductModelOrderCompleted().createReport(input)
    .then(() => {
      showOrderReportModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successCreated')
      })
      clearAction();
      refresh();
    })
    .catch((res) => {
      reportActionErr.value = res.response.data['hydra:description'];
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => loading.value = false);
}

function clearAction() {
  selectedData.value = {};
  rows.value = [{ size: '', quantity: '', max: '' }];
}
function prefill() {
  let sizes = [];
  selectedData.value.productSize.forEach((size) => {
    sizes.push({ size: size.size, quantity: '', max: size.quantity });
  });
  rows.value = sizes;
}
function refresh() {
  getWarehouse();
}

onMounted(() => {
  refresh()
})

const searchTitle = ref();
const filteredProducts = computed(() => {
  if (!searchTitle.value) {
    return warehouse.value.productInWarehouses || [];
  }

  return (warehouse.value.productInWarehouses || []).filter(item =>
    item.productModel.name.toLowerCase().includes(searchTitle.value.toLowerCase())
  );
});
</script>

<template>
  <div class="q-my-md flex justify-end">
    <refresh-button :action="refresh" />
  </div>

  <div v-show="loading" class=" q-mb-md flex justify-center">
    <q-spinner
      color="primary"
      size="4em"
    />
  </div>

  <div class="q-mb-lg shadow-3">
    <q-table
      :loading="loading || warehouseActionLoading"
      flat
      bordered
      :rows="warehouseActions"
      :columns="columns"
      :visible-columns="visibleColumns"
      :no-data-label="$t('tables.transaction.header.empty')"
      color="primary"
      row-key="id"
      :pagination="warehouseActionPagination"
      hide-bottom
    >
      <template v-slot:top>
        <div class="col-12 flex justify-between">
          <div class="q-table__title">{{ $t('tables.warehouseAction.header.title') }}</div>
          <q-select
            style="min-width: 100px;"
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
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : 'q-mr-sm'"
          />
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            <div v-if="col.name === 'sentBy'">
              {{ props.row.sentBy.fullName }}
            </div>
            <div v-else-if="col.name === 'productModel'">
              {{ props.row.productModel.name }}
            </div>
            <div v-else-if="col.name === 'productSize'">
              <div
                v-for="consume in props.row.productSize"
                :key="consume"
              >
                {{ consume.size }} : {{ consume.quantity }}
              </div>
            </div>
            <div v-else-if="col.name === 'fromWarehouse'">
              {{ $t('warehouses.' + props.row.fromWarehouse.name) }}
            </div>
            <div v-else-if="col.name === 'toWarehouse'">
              {{ $t('warehouses.' + props.row.toWarehouse.name) }}
            </div>
            <div v-else-if="col.name === 'status'">
              <div v-if="props.row.status === 'pending'" class="text-red">
                {{ $t('statuses.' + props.row.status) }}
              </div>
              <div v-else-if="props.row.status === 'accepted'" class="text-green">
                {{ $t('statuses.' + props.row.status) }}
              </div>
              <div v-else class="text-orange">
                {{ $t('statuses.' + props.row.status) }}
              </div>
            </div>
            <div v-else-if="col.name === 'action' && props.row.status === 'pending'">
              <div class="flex no-wrap q-gutter-x-sm">
                <q-btn
                  dense
                  no-caps
                  no-wrap
                  color="green"
                  icon-right="mdi-check"
                  @click="selectedData = {...props.row}; showAcceptModal = true;"
                >
                  <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                    {{ $t('accept') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  dense
                  no-caps
                  no-wrap
                  size="md"
                  color="red"
                  icon-right="mdi-cancel"
                  @click="selectedData = {...props.row}; showRejectModal = true;"
                >
                  <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                    {{ $t('reject') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
            <div v-else>
              {{ props.row[col.field] }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <div
    v-show="!loading && !warehouseActionLoading"
    v-if="warehouseActionTotal > warehouseActionPagination.rowsPerPage"
    class="row justify-center q-mt-md"
  >
    <q-pagination
      :disable="warehouseActionLoading"
      v-model="warehouseActionPagination.page"
      input-class="text-bold text-black"
      :max="warehouseActionPagesNumber"
      color="primary"
      input
      size="md"
      @update:model-value="getWarehouseAction({ page: warehouseActionPagination.page })"
    />
  </div>
  </div>

  <h4 class="q-mb-sm">
    {{ $t('tables.model.header.title') }}
  </h4>

  <q-list
    v-show="!loading"
    bordered
    separator
    class="q-mb-md shadow-3"
  >
    <q-input
      style="min-width: 225px"
      dense
      clearable
      v-model="searchTitle"
      class="q-mx-md"
      :label="$t('tables.users.header.searchTitle')"
    >
      <template v-slot:append>
        <q-icon name="search" color="primary" />
      </template>
    </q-input>
    <q-item v-if="!filteredProducts.length">
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">{{ $t('productNotFound') }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      v-for="(item, index) in filteredProducts"
      :key="item"
    >
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">{{ item.productModel.name }}</q-item-label>
        <q-item-label caption>
          <span
            v-for="size in item.productSize"
            :key="size"
            class="q-pl-xs text-primary text-subtitle2 text-weight-bold"
          >
            {{ size.size }} : {{ size.quantity }} {{ warehouse.productInWarehouses.length !== index ? '' : ',' }}
          </span>
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <div class="flex justify-end">
          <q-btn
            color="primary"
            icon="mdi-dots-vertical"
            size="sm"
            round
          >
            <q-menu>
              <q-card>
                <q-item
                  v-close-popup
                  class="text-orange"
                  clickable
                  @click="selectedData = {...item}; prefill(); showOrderReportModal = true;"
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="mdi-cube-send"
                      color="orange"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('report') }}
                  </q-item-section>
                </q-item>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>
  </q-list>

  <!-- Dialogs -->
  <q-dialog v-model="showOrderReportModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="reportOrderAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="reportActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.completedMaterialOrderReport.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="reportActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ reportActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-mb-lg"
        >
          <q-input
            filled
            disable
            v-model="row.size"
            :label="$t('forms.modelOrder.fields.size.label')"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            :prefix="`max ${row.max}:`"
            v-model.number="row.quantity"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
            :rules="[ val => val !== undefined && val > -1 && val <= row.max || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.modelOrder.fields.expectedOutlayRipeMaterial.title') }}
        </div>
        <div
          v-for="(row, index) in consumedRows" :key="index"
          class="row q-px-md q-col-gutter-x-md q-col-gutter-y-md q-mb-lg"
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
            fetch-method="getAll"
            :item-label="{ label: 'ripeMaterial', path: 'name' }"
            :rule-message="$t('forms.modelOrder.fields.productModel.validation.required')"
            class="col-12"
          />
          <!-- max quantity: model uchun necha kg ishlatildi? -->
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantity) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.quantity} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            v-model.number="row.quantity"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.consumedQuantity.label')"
            :rules="[ val => val !== undefined && val >= 0 && val <= row.cutterRipeMaterialWarehouse.quantity || $t('forms.modelOrder.fields.consumedQuantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <!-- atxot wasteSort1: necha kg otxodga chiqdi? -->
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantity) > 0"
            v-model.number="row.wasteSort1"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.wasteSort1.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.modelOrder.fields.wasteSort1.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <div v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort1) > 0" class="col-12">
            <q-toggle v-model="selectedData.hasUsedOldRemaining" :label="$t('isUsedRemainingMaterial')" />
          </div>
          <!-- eski qoldiqdan ishlatildi remainingSort1: 1 sort material qoldiqdan qancha ishlatildi? -->
          <q-input
            v-if="selectedData.hasUsedOldRemaining && row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort1) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.remainingSort1} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            filled
            type="number"
            v-model.number="row.remainingSort1"
            :label="$t('forms.modelOrder.fields.remainingSort1.label')"
            :rules="[ val => val !== undefined && val >= 0 && val <= row.cutterRipeMaterialWarehouse.remainingSort1 || $t('forms.modelOrder.fields.remainingSort1.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <!-- wasteRemainingSort1: 1 sort material qoldiqdan necha kg otxodga chiqdi? -->
          <q-input
            v-if="selectedData.hasUsedOldRemaining && row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort1) > 0"
            v-model.number="row.wasteRemainingSort1"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.wasteRemainingSort1.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.modelOrder.fields.wasteRemainingSort1.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />

          <!-- quantitySort2: model uchun necha kg ishlatildi? -->
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantitySort2) > 0"
            filled
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.quantitySort2} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            type="number"
            v-model.number="row.quantitySort2"
            :label="$t('forms.modelOrder.fields.quantitySort2.label')"
            :rules="[ val => val !== undefined && val >= 0 && val <= row.cutterRipeMaterialWarehouse.quantitySort2 || $t('forms.modelOrder.fields.quantitySort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <!-- wasteSort2: necha kg otxodga chiqdi? -->
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantitySort2) > 0"
            v-model.number="row.wasteSort2"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.wasteSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.modelOrder.fields.wasteSort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <!-- remainingSort2: 2 sort material qoldiqdan qancha ishlatildi? -->
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort2) > 0"
            :prefix="`max: ${row.cutterRipeMaterialWarehouse.remainingSort2} ${row.cutterRipeMaterialWarehouse.ripeMaterial.measurement}`"
            filled
            type="number"
            v-model.number="row.remainingSort2"
            :label="$t('forms.modelOrder.fields.remainingSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 && val <= row.cutterRipeMaterialWarehouse.remainingSort2 || $t('forms.modelOrder.fields.remainingSort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <!-- wasteRemainingSort2: 2 sort material qoldiqdan necha kg otxodga chiqdi? -->
          <q-input
            v-if="row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.remainingSort2) > 0"
            v-model.number="row.wasteRemainingSort2"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.wasteRemainingSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.modelOrder.fields.wasteRemainingSort2.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />

          <div class="col-12">
            <q-toggle v-model="selectedData.hasNewRemaining" label="Left new remaining?" />
          </div>
          <!-- newRemainingSort1: yangi qoldiq qoldimi? -->
          <q-input
            v-if="selectedData.hasNewRemaining && row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantity) > 0"
            v-model.number="row.newRemainingSort1"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.newRemainingSort1.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.modelOrder.fields.newRemainingSort1.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <!-- newRemainingSort2: yangi qoldiq qoldimi? -->
          <q-input
            v-if="selectedData.hasNewRemaining && selectedData.hasNewRemaining && row.cutterRipeMaterialWarehouse && Number(row.cutterRipeMaterialWarehouse.quantitySort2) > 0"
            v-model.number="row.newRemainingSort2"
            filled
            type="number"
            :label="$t('forms.modelOrder.fields.newRemainingSort2.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.modelOrder.fields.newRemainingSort2.validation.required')]"
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
            :disable="loading || warehouseActionLoading"
            :loading="loading || warehouseActionLoading"
            no-caps
            :label="$t('forms.completedMaterialOrderReport.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator />
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showAcceptModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.accept.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.accept.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || warehouseActionLoading"
          :loading="loading || warehouseActionLoading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction();"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRejectModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.reject.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.reject.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.reject.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || warehouseActionLoading"
          :loading="loading || warehouseActionLoading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="rejectAction()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
