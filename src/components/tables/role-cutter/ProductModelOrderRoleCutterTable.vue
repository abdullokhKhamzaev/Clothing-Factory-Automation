<script setup>
import { ref } from "vue";
import { useProductModelOrder } from "stores/productModelOrder.js";
import { useAbout } from "stores/user/about.js";
import { useProductModelOrderCompleted } from "stores/productModelOrderCompleted.js";
import { useCutterRipeMaterialWarehouse } from "stores/cutterRipeMaterialWarehouse.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SelectableList from "components/selectableList.vue";
import CutReportList from "components/CutReportList.vue";
import {formatDate} from "src/libraries/constants/defaults.js";

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
const user = useAbout();
const order = useProductModelOrder();
const cutterWarehouse = useCutterRipeMaterialWarehouse();

const selectedData = ref({});
const orderLoading = ref(false);
const rows = ref([{ size: '', quantity: '' }]);
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

const showAcceptModal = ref(false);
const showOrderReportModal = ref(false);
const reportActionErr = ref(false);

const columns = [
  {name: 'id', label: '#ID', align: 'left', field: 'id'},
  {name: 'productModel', label: t('tables.modelOrder.columns.productModel'), align: 'left', field: 'productModel'},
  {name: 'productSize', label: t('tables.modelOrder.columns.productSize'), align: 'left', field: 'productSize'},
  {name: 'createdAt', label: t('tables.modelOrder.columns.createdAt'), align: 'left', field: 'createdAt'},
  {name: 'createdBy', label: t('tables.modelOrder.columns.createdBy'), align: 'left', field: 'createdBy'},
  {name: 'productModelOrderCompleteds', label: t('tables.modelOrder.columns.productModelOrderCompleteds'), align: 'left', field: 'productModelOrderCompleteds'},
  {name: 'status', label: t('tables.modelOrder.columns.status'), align: 'left', field: 'status'},
  {name: 'action', label: '', align: 'right', field: 'action'}
];

function shouldShowAction(data) {
  return !data.some(order => order.status === 'pending');
}

function clearAction() {
  selectedData.value = {};
  reportActionErr.value = false;
  rows.value = [{ size: '', quantity: '' }];
  consumedRows.value = [{
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
  }];
}

function prefill() {
  let sizes = [];
  selectedData.value.productSize.forEach((size) => {
    sizes.push({ size: size.size, quantity: '' });
  });
  rows.value = sizes;
}
function confirmOrder() {
  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }

  orderLoading.value = true;

  const input = {
    confirmedBy: user.about['@id'],
    status: 'confirmed'
  }

  order.confirm(selectedData.value.id, input)
    .then(() => {
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.successReceived')
      })
      showAcceptModal.value = false;
      getOrders();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.modelOrder.confirmation.failureReceived')
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
    productModelOrder: selectedData.value['@id'],
    productModel: selectedData.value.productModel['@id'],
    productSize: productSize,
    outlayRipeMaterial: consumedMaterials,
    createdBy: user.about['@id']
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
      // clearAction();
      getOrders();
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
    .finally(() => orderLoading.value = false);
}
function getOrders() {
  emit('submit');
}
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
    :no-data-label="$t('tables.modelOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.modelOrder.header.title') }}</div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'action'" class="flex justify-end">
            <q-btn
              v-if="props.row.status !== 'confirmed'"
              no-caps
              dense
              :label="$t('accept')"
              size="md"
              color="green"
              @click="selectedData = {...props.row}; showAcceptModal = true"
            />
            <q-btn
              v-else-if="shouldShowAction(props.row?.productModelOrderCompleteds)"
              dense
              no-caps
              no-wrap
              size="md"
              color="orange"
              :label="$t('report')"
              @click="selectedData = {...props.row}; prefill(); showOrderReportModal = true;"
            />
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
          :disable="props.loading || orderLoading"
          :loading="props.loading || orderLoading"
          no-caps :label="$t('dialogs.accept.buttons.accept')" color="green" @click="confirmOrder();" />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
            v-model.number="row.quantity"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
            :rules="[ val => val !== undefined && val > -1 || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
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
            <q-toggle v-model="selectedData.hasUsedOldRemaining" label="Did you use old remaining material?" />
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
            :disable="props.loading || orderLoading"
            :loading="props.loading || orderLoading"
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
</template>
