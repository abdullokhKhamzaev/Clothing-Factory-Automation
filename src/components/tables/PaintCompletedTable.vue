<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useAbout } from "stores/user/about.js";
import { useMaterial } from "stores/material.js";
import { usePaintFabric } from "stores/paintFabric.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import { DATE_FORMAT } from "src/libraries/constants/defaults.js"
import { useRipeMaterialOrder } from "stores/ripeMaterialOrder.js";

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
const createActionErr = ref(null);
const paintLoading = ref(false);

const unripeMaterials = ref({});
const materialLoading = ref(false);
function getUnRipeMaterials () {
  materialLoading.value = true;

  useMaterial().fetchMaterials('')
    .then((res) => {
      unripeMaterials.value = res.data['hydra:member'];
    })
    .finally(() => {
      materialLoading.value = false;
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
})

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
})

const columns = [
  { name: 'id', label: "#ID", align: 'left', field: 'id' },
  { name: 'sentQuantitySort1', label: t('tables.paint.columns.sentQuantitySort1'), align: 'left', field: 'sentQuantitySort1' },
  { name: 'sentRollSort1', label: t('tables.paint.columns.sentRollSort1'), align: 'left', field: 'sentRollSort1' },
  { name: 'sentQuantitySort2', label: t('tables.paint.columns.sentQuantitySort2'), align: 'left', field: 'sentQuantitySort2' },
  { name: 'sentRollSort2', label: t('tables.paint.columns.sentRollSort2'), align: 'left', field: 'sentRollSort2' },
  { name: 'status', label: t('tables.paint.columns.status'), align: 'left', field: 'status' },
  { name: 'createdBy', label: t('tables.paint.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'receivedBy', label: t('tables.paint.columns.receivedBy'), align: 'left', field: 'receivedBy' },
  { name: 'paintFabric', label: t('tables.paint.columns.paintFabric'), align: 'left', field: 'paintFabric' },
  { name: 'createdAt', label: t('tables.paint.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'receivedAt', label: t('tables.paint.columns.receivedAt'), align: 'left', field: 'receivedAt' },
  { name: 'dealDate', label: t('tables.paint.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'unripeMaterial', label: t('tables.paint.columns.unripeMaterial'), align: 'left', field: 'unripeMaterial' },
  { name: 'ripeMaterialOrderAccepteds', label: t('tables.paint.columns.ripeMaterialOrderAccepteds'), align: 'left', field: 'ripeMaterialOrderAccepteds' },
];
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
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
        message: t('forms.paint.confirmation.successSent')
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

onMounted(() => {
  getUnRipeMaterials();
  getFabrics();
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
            <div v-if="col.name === 'name'">
              {{ props.row.name }}
            </div>
            <div v-else>
              {{ props.row[col.field] }}
            </div>
          </q-td>
        </q-tr>
      </template>
  </q-table>

  <!-- Dialogs -->
  <q-dialog v-model="showPurchaseModal" persistent>
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
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction"/>
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
            :loading="materialLoading"
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
</template>
