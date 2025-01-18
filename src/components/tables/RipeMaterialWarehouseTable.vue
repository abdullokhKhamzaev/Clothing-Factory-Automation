<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useRipeMaterialPurchase } from "stores/ripeMaterialPurchase.js";
import { useAbout } from "stores/user/about.js";
import { useBudget } from "stores/budget.js";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SelectableList from "components/selectableList.vue";

const emit = defineEmits(['submit']);
let props = defineProps({
  materials: {
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
const ripeMaterial = useRipeMaterial();
const budget = useBudget();

const selectedData = ref({});
const showPurchaseModal = ref(false);
const createActionErr = ref(null);
const columns = [
  { name: 'name', label: t('tables.ripeMaterial.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.ripeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.ripeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.ripeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.ripeMaterial.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'price', label: t('tables.ripeMaterial.columns.price'), align: 'left', field: 'price' }
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

  let input;

  const isSort1 = selectedData.value.whichSort === 'sort1';
  const isSort2 = selectedData.value.whichSort === 'sort2';

  if (isSort1 || isSort2) {
    const quantity = isSort1 ? selectedData.value.quantity : selectedData.value.quantitySort2;
    const price = isSort1 ? selectedData.value.price : selectedData.value.priceSort2;
    const roll = isSort1 ? selectedData.value.roll : selectedData.value.rollSort2;
    const paidPrice = isSort1 ? selectedData.value.paidPriceSort1 : selectedData.value.paidPriceSort2;
    const totalPrice = String(quantity * price);

    input = {
      ripeMaterial: selectedData.value.ripeMaterial,
      quantity: quantity,
      price: String(price),
      roll: roll,
      totalPrice: totalPrice,
      paidPrice: paidPrice,
      budget: selectedData.value.budget,
      purchasedBy: user.about['@id'],
      transaction: [{
        paidPrice: paidPrice,
        createdBy: user.about['@id'],
        isIncome: false,
        description: 'Material sotib olish',
        budget: selectedData.value.budget,
        isOldInAndOut: false,
        price: totalPrice
      }],
      isPayed: Number(paidPrice) === Number(totalPrice)
    };
  } else {
    console.warn('sort is not found');
  }

  useRipeMaterialPurchase().createPurchase(input)
    .then(() => {
      showPurchaseModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successBought')
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
        message: t('forms.ripeMaterialPurchase.confirmation.failure')
      })
    })
}
</script>

<template>
  <skeleton-table
    :loading="props.loading"
  />
  <q-table
    v-show="!loading"
    flat
    bordered
    :rows="props.materials"
    :columns="columns"
    :no-data-label="$t('tables.ripeMaterial.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-md-center justify-between">
        <div class="q-table__title">{{ $t('tables.ripeMaterial.header.title') }}</div>
        <q-btn no-caps :label="$t('tables.ripeMaterial.buttons.add')" color="primary" @click="showPurchaseModal = true" />
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'name'">
            {{ props.row.name }}
          </div>

          <div v-else-if="col.name === 'quantity'">
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
          </div>

          <div v-else-if="col.name === 'price'">
            <span> {{ props.row.price * props.row.quantity }} </span>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
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
          <div class="text-h6"> {{ $t('dialogs.ripeMaterialPurchase.barCreate') }}</div>
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
          <selectable-list
            v-model="selectedData.ripeMaterial"
            :label="$t('forms.ripeMaterialPurchase.fields.ripeMaterial.label')"
            :store="ripeMaterial"
            fetch-method="fetchRipeMaterials"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.ripeMaterialPurchase.fields.ripeMaterial.validation.required')"
            class="col-12"
          />
          <div class="col-12 q-gutter-sm">
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="sort1" label="Sort 1" />
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="sort2" label="Sort 2" />
          </div>
          <q-input
            v-if="selectedData.whichSort === 'sort1'"
            v-model="selectedData.quantity"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.quantity.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-if="selectedData.whichSort === 'sort1'"
            v-model="selectedData.price"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialPurchase.fields.price.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-if="selectedData.whichSort === 'sort1'"
            v-model.number="selectedData.roll"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.roll.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterialPurchase.fields.roll.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.paidPriceSort1"
            v-if="selectedData.whichSort === 'sort1'"
            :prefix="Number(selectedData.quantity * selectedData.price) + ':'"
            :disable="!selectedData.budget || !selectedData.quantity || !selectedData.price"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.paidPrice.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 && val <= Number(selectedData.quantity * selectedData.price) || $t('forms.ripeMaterialPurchase.fields.paidPrice.validation.required')]"
            hide-bottom-space
            :class="selectedData.whichSort ? 'col-6' : 'col-12'"
          />
          <q-input
            v-if="selectedData.whichSort === 'sort2'"
            v-model="selectedData.quantitySort2"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.quantitySort2.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialPurchase.fields.quantitySort2.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-if="selectedData.whichSort === 'sort2'"
            v-model="selectedData.priceSort2"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.priceSort2.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.ripeMaterialPurchase.fields.priceSort2.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model.number="selectedData.rollSort2"
            v-if="selectedData.whichSort === 'sort2'"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.rollSort2.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterialPurchase.fields.rollSort2.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.paidPriceSort2"
            v-if="selectedData.whichSort === 'sort2'"
            :prefix="Number(selectedData.quantitySort2 * selectedData.priceSort2) + ':'"
            :disable="!selectedData.budget || !selectedData.quantitySort2 || !selectedData.priceSort2"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.paidPrice.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 && val <= Number(selectedData.quantitySort2 * selectedData.priceSort2) || $t('forms.ripeMaterialPurchase.fields.paidPrice.validation.required')]"
            hide-bottom-space
            :class="selectedData.whichSort ? 'col-6' : 'col-12'"
          />
          <selectable-list
            v-model="selectedData.budget"
            v-if="selectedData.whichSort"
            :label="$t('forms.threadPurchase.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.threadPurchase.fields.budget.validation.required')"
            class="col-12"
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.threadPurchase.buttons.buy')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
