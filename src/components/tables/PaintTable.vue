<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useAbout } from "stores/user/about.js";
import { useMaterial } from "stores/material.js";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import { usePaintFabric } from "stores/paintFabric.js";
import { useRipeMaterialOrder } from "stores/ripeMaterialOrder.js";
import { useBudget } from "stores/budget.js";
import { DATE_FORMAT } from "src/libraries/constants/defaults.js"
import { useRipeMaterialOrderAccept } from "stores/ripeMaterialOrderAccept.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

const emit = defineEmits(['submit']);
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

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();

const selectedData = ref({});
const showPurchaseModal = ref(false);
const showDeleteModal = ref(false);
const showReceiveModal = ref(false);
const createActionErr = ref(null);
const receiveActionErr = ref(null);
const showOrderFinishModal = ref(false);
const paintLoading = ref(false);

const unripeMaterials = ref({});
const unripeMaterialLoading = ref(false);
function getUnRipeMaterials () {
  unripeMaterialLoading.value = true;

  useMaterial().fetchMaterials('')
    .then((res) => {
      unripeMaterials.value = res.data['hydra:member'];
    })
    .finally(() => {
      unripeMaterialLoading.value = false;
    });
}
const unripeMaterialOptions = computed(() => {
  let options = [];
  for (let i in unripeMaterials.value) {
    options.push({
      label: unripeMaterials.value[i].name,
      value: unripeMaterials.value[i]
    });
  }
  return options
});

const fabrics = ref({});
const fabricLoading = ref(false);
function getFabrics () {
  fabricLoading.value = true;

  usePaintFabric().fetchFabrics('')
    .then((res) => {
      fabrics.value = res.data['hydra:member'];
    })
    .finally(() => {
      fabricLoading.value = false;
    });
}
const fabricOptions = computed(() => {
  let options = [];
  for (let i in fabrics.value) {
    options.push({
      label: fabrics.value[i].name,
      value: fabrics.value[i]
    });
  }
  return options
});

const ripeMaterials = ref({});
const ripeMaterialLoading = ref(false);
function getRipeMaterials () {
  unripeMaterialLoading.value = true;

  useRipeMaterial().fetchRipeMaterials('')
    .then((res) => {
      ripeMaterials.value = res.data['hydra:member'];
    })
    .finally(() => {
      ripeMaterialLoading.value = false;
    });
}
const ripeMaterialOptions = computed(() => {
  let options = [];
  for (let i in ripeMaterials.value) {
    options.push({
      label: ripeMaterials.value[i].name,
      value: ripeMaterials.value[i]
    });
  }
  return options
});

const budgets = ref({});
const budgetLoading = ref(false);
function getBudgets () {
  budgetLoading.value = true;

  useBudget().fetchBudgets('')
    .then((res) => {
      budgets.value = res.data['hydra:member'];
    })
    .finally(() => {
      budgetLoading.value = false;
    });
}
const budgetOptions = computed(() => {
  let options = [];
  for (let i in budgets.value) {
    options.push({
      label: budgets.value[i].name,
      value: budgets.value[i]
    });
  }
  return options
});

const columns = [
  { name: 'id', label: "#ID", align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.paint.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'unripeMaterial', label: t('tables.paint.columns.unripeMaterial'), align: 'left', field: 'unripeMaterial' },
  { name: 'createdBy', label: t('tables.paint.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'paintFabric', label: t('tables.paint.columns.paintFabric'), align: 'left', field: 'paintFabric' },
  { name: 'dealDate', label: t('tables.paint.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'sentQuantitySort1', label: t('tables.paint.columns.sentQuantitySort1'), align: 'left', field: 'sentQuantitySort1' },
  { name: 'sentRollSort1', label: t('tables.paint.columns.sentRollSort1'), align: 'left', field: 'sentRollSort1' },
  { name: 'sentQuantitySort2', label: t('tables.paint.columns.sentQuantitySort2'), align: 'left', field: 'sentQuantitySort2' },
  { name: 'sentRollSort2', label: t('tables.paint.columns.sentRollSort2'), align: 'left', field: 'sentRollSort2' },
  { name: 'ripeMaterialOrderAccepteds', label: t('tables.paint.columns.ripeMaterialOrderAccepteds'), align: 'left', field: 'ripeMaterialOrderAccepteds' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];

function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  receiveActionErr.value = null;
}
function createAction() {
  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  paintLoading.value = true;

  let input;

  if (selectedData.value.whichSort === 1) {
    input = {
      sentQuantitySort1: selectedData.value.sentQuantitySort1,
      sentRollSort1: selectedData.value.sentRollSort1,
      createdBy: user.about['@id'],
      paintFabric: selectedData.value.paintFabric['@id'],
      dealDate: selectedData.value.dealDate,
      unripeMaterial: selectedData.value.unripeMaterial['@id']
    }
  } else if (selectedData.value.whichSort === 2) {
    input = {
      sentQuantitySort2: selectedData.value.sentQuantitySort2,
      sentRollSort2: selectedData.value.sentRollSort2,
      createdBy: user.about['@id'],
      paintFabric: selectedData.value.paintFabric['@id'],
      dealDate: selectedData.value.dealDate,
      unripeMaterial: selectedData.value.unripeMaterial['@id']
    }
  }

  useRipeMaterialOrder().createRipeMaterialOrder(input)
    .then(() => {
      showPurchaseModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.successOrderCreated')
      })
      clearAction();
      emit('submit');
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.failure')
      })
    })
    .finally(() => paintLoading.value = false)
}
function receiveAction() {
  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  paintLoading.value = true;

  let input = {
    ripeMaterial: selectedData.value.ripeMaterial['@id'],
    budget: selectedData.value.budget['@id'],
    price: selectedData.value.price,
    servicePrice: selectedData.value.servicePrice,
    payedPrice: selectedData.value.payedPrice,
    ripeMaterialOrder: selectedData.value['@id'],
    receivedBy: user.about['@id'],
    transaction: [
      {
        paidPrice: selectedData.value.payedPrice,
        createdBy: user.about['@id'],
        isIncome: false,
        description: 'Material bo\'yoq uchun.',
        budget: selectedData.value.budget['@id'],
        isOldInAndOut: false,
        price: selectedData.value.price
      }
    ]
  };

  input.isPayed = selectedData.value.payedPrice === selectedData.value.servicePrice;

  if (selectedData.value.whichSort === 1) {
    input.receivedQuantitySort1 = selectedData.value.receivedQuantitySort1;
    input.receivedRollSort1 = selectedData.value.receivedRollSort1;
  } else if (selectedData.value.whichSort === 2) {
    input.receivedQuantitySort2 = selectedData.value.receivedQuantitySort2;
    input.receivedRollSort2 = selectedData.value.receivedRollSort2;
  }

  useRipeMaterialOrderAccept().accept(input)
    .then(() => {
      showReceiveModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.successOrderReceived')
      })
      clearAction();
      emit('submit');
    })
    .catch((res) => {
      receiveActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.failure')
      })
    })
    .finally(() => paintLoading.value = false)
}
function deleteAction() {
  if (!selectedData.value.id) {
    console.warn('data is empty');
    return;
  }
  paintLoading.value = true;
  useRipeMaterialOrder().deleteRipeMaterialOrder(selectedData.value.id)
    .then(() => {
      showDeleteModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.successOrderDeleted')
      });
      clearAction();
      emit('submit');
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.failure')
      })
    })
    .finally(() => paintLoading.value = false)
}
function finishOrderAction() {
  if (!selectedData.value.id || !user.about['@id']) {
    console.warn('data is empty');
    return
  }

  paintLoading.value = true;

  const input = {
    status: 'accepted',
    receivedBy: user.about['@id']
  }

  useRipeMaterialOrder().completeRipeMaterialOrder(selectedData.value.id, input)
    .then(() => {
      showOrderFinishModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.successOrderCompleted')
      })
      clearAction();
      emit('submit');
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.paint.confirmation.failure')
      })
    })
    .finally(() => paintLoading.value = false);
}

onMounted(() => {
  getUnRipeMaterials();
  getFabrics();
  getRipeMaterials();
  getBudgets();
})
</script>

<template>
  <skeleton-table
    :loading="props.loading || paintLoading"
  />
  <q-table
    v-show="!props.loading && !paintLoading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :no-data-label="$t('tables.paint.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-md-center justify-between">
        <div class="q-table__title">{{ $t('tables.paint.header.title') }}</div>
        <q-btn no-caps :label="$t('tables.paint.buttons.add')" color="primary" @click="showPurchaseModal = true" />
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'action' && props.row.status === 'expected'" class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                size="md"
                rounded dense
                icon="mdi-arrow-down-bold"
                color="green"
                @click="showReceiveModal = true; selectedData = {...props.row}"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('receive') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.ripeMaterialOrderAccepteds.length"
                size="md"
                rounded dense
                icon="mdi-store-check"
                color="primary"
                @click="showOrderFinishModal = true; selectedData = {...props.row}"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('finish') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                v-else
                size="md"
                color="red"
                rounded
                dense
                icon="delete"
                @click="showDeleteModal = true; selectedData = {...props.row}"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('delete') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div v-else-if="col.name === 'ripeMaterialOrderAccepteds'">
            <q-toggle
              v-if="props.row?.ripeMaterialOrderAccepteds.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.paint.columns.ripeMaterialOrderAccepteds')"
            />
            <span v-else>
            -
          </span>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          {{ props.row.ripeMaterialOrderAccepteds }}
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <!-- Dialogs -->
  <q-dialog v-model="showPurchaseModal" persistent @before-hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.paint.barCreate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
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
          <q-select
            v-model="selectedData.unripeMaterial"
            filled
            emit-value
            map-options
            :loading="unripeMaterialLoading"
            :options="unripeMaterialOptions"
            :label="$t('forms.paint.fields.unripeMaterial.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.paint.fields.unripeMaterial.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-select
            v-model="selectedData.paintFabric"
            filled
            emit-value
            map-options
            :loading="fabricLoading"
            :options="fabricOptions"
            :label="$t('forms.paint.fields.paintFabric.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.paint.fields.paintFabric.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
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
            :label="$t('forms.paint.fields.sentQuantitySort1.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.paint.fields.sentQuantitySort1.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model.number="selectedData.sentRollSort1"
            v-if="selectedData.whichSort === 1"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.paint.fields.sentRollSort1.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.paint.fields.sentRollSort1.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model="selectedData.sentQuantitySort2"
            v-if="selectedData.whichSort === 2"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.paint.fields.sentQuantitySort2.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.paint.fields.sentQuantitySort2.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model.number="selectedData.sentRollSort2"
            v-if="selectedData.whichSort === 2"
            :disable="!selectedData.whichSort"
            type="number"
            filled
            :label="$t('forms.paint.fields.sentRollSort2.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.paint.fields.sentRollSort2.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            filled
            v-model="selectedData.dealDate"
            :disable="!selectedData.whichSort"
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
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.paint.buttons.order')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showReceiveModal" persistent @before-hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="receiveAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="receiveActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterialAccepted.barAccept') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="receiveActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ receiveActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-select
            v-model="selectedData.ripeMaterial"
            filled
            emit-value
            map-options
            :loading="ripeMaterialLoading"
            :options="ripeMaterialOptions"
            :label="$t('forms.ripeMaterialAccepted.fields.ripeMaterial.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.ripeMaterialAccepted.fields.ripeMaterial.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <div class="col-12 q-gutter-sm">
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" :val="1" label="Sort 1" />
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" :val="2" label="Sort 2" />
          </div>
          <div
            v-if="selectedData.whichSort === 1"
            class="col-12"
          >
            <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
              <q-input
                v-model="selectedData.receivedQuantitySort1"
                :disable="selectedData.whichSort !== 1"
                type="number"
                filled
                :label="$t('forms.ripeMaterialAccepted.fields.receivedQuantitySort1.label')"
                lazy-rules
                :rules="[ val => val && val <= Number(selectedData.sentQuantitySort1) || $t('forms.ripeMaterialAccepted.fields.receivedQuantitySort1.validation.required')]"
                hide-bottom-space
                class="col-12"
              />
              <q-input
                v-model.number="selectedData.receivedRollSort1"
                type="number"
                filled
                :label="$t('forms.ripeMaterialAccepted.fields.receivedRollSort1.label')"
                lazy-rules
                :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterialAccepted.fields.receivedRollSort1.validation.required')]"
                hide-bottom-space
                class="col-12"
              />
            </div>
          </div>
          <div
            v-if="selectedData.whichSort === 2"
            class="col-12"
          >
            <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
              <q-input
                v-model="selectedData.receivedQuantitySort2"
                type="number"
                filled
                :label="$t('forms.ripeMaterialAccepted.fields.receivedQuantitySort2.label')"
                lazy-rules
                :rules="[ val => val && val >= 0 && val <= Number(selectedData.sentQuantitySort2) || $t('forms.ripeMaterialAccepted.fields.receivedQuantitySort2.validation.required')]"
                hide-bottom-space
                class="col-12"
              />
              <q-input
                v-model.number="selectedData.receivedRollSort2"
                type="number"
                filled
                :label="$t('forms.ripeMaterialAccepted.fields.receivedRollSort2.label')"
                lazy-rules
                :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterialAccepted.fields.receivedRollSort2.validation.required')]"
                hide-bottom-space
                class="col-12"
              />
            </div>
          </div>
          <q-select
            v-model="selectedData.budget"
            v-if="selectedData.whichSort"
            filled
            emit-value
            map-options
            :loading="budgetLoading"
            :options="budgetOptions"
            :label="$t('forms.ripeMaterialAccepted.fields.budget.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.ripeMaterialAccepted.fields.budget.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.servicePrice"
            v-if="selectedData.whichSort"
            :disable="!selectedData.budget"
            type="number"
            filled
            :label="$t('forms.ripeMaterialAccepted.fields.servicePrice.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialAccepted.fields.servicePrice.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model="selectedData.price"
            v-if="selectedData.whichSort"
            :disable="!selectedData.budget"
            type="number"
            filled
            :label="$t('forms.ripeMaterialAccepted.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialAccepted.fields.price.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-input
            v-model="selectedData.payedPrice"
            v-if="selectedData.whichSort"
            :disable="!selectedData.budget"
            type="number"
            filled
            :label="$t('forms.ripeMaterialAccepted.fields.payedPrice.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialAccepted.fields.payedPrice.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.ripeMaterialAccepted.buttons.accept')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
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
  <q-dialog v-model="showDeleteModal" persistent>
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
        <q-btn :label="$t('dialogs.delete.buttons.confirm')" color="red" @click="deleteAction"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
