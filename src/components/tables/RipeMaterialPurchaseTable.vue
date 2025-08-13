<script setup>
import { onMounted, ref } from "vue";
import { useRipeMaterialPurchase } from "stores/ripeMaterialPurchase.js";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import { useBudget } from "stores/budget.js";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatDate, formatFloatToInteger, isToday } from "src/libraries/constants/defaults.js";
import TransactionList from "components/TransactionList.vue";
import RefreshButton from "components/RefreshButton.vue";
import {useAbout} from "stores/user/about.js";
import SelectableList from "components/selectableList.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const budget = useBudget();
const ripeMaterial = useRipeMaterial();
const paymentLoading = ref(false);
const showPayModal = ref(false);
const payActionErr = ref(null);
const selectedData = ref({});
const showPurchaseModal = ref(false);
const createActionErr = ref(null);

const columns = [
  { name: 'id', label: t('tables.ripeMaterialPurchase.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.ripeMaterialPurchase.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'purchasedBy', label: t('tables.ripeMaterialPurchase.columns.purchasedBy'), align: 'left', field: 'purchasedBy' },
  { name: 'ripeMaterial', label: t('tables.ripeMaterialPurchase.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'quantity', label: t('tables.ripeMaterialPurchase.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'quantitySort2', label: t('tables.ripeMaterialPurchase.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'price', label: t('tables.ripeMaterialPurchase.columns.price'), align: 'left', field: 'price' },
  { name: 'priceSort2', label: t('tables.ripeMaterialPurchase.columns.priceSort2'), align: 'left', field: 'priceSort2' },
  { name: 'roll', label: t('tables.ripeMaterialPurchase.columns.roll'), align: 'left', field: 'roll' },
  { name: 'rollSort2', label: t('tables.ripeMaterialPurchase.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'totalPrice', label: t('tables.ripeMaterialPurchase.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'paidPrice', label: t('tables.ripeMaterialPurchase.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'transaction', label: t('tables.ripeMaterialPurchase.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'left', field: 'action' },
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useRipeMaterialPurchase();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  // ...
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchPurchases({...pagination.value, ...filters.value})
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

function clearAction () {
  selectedData.value = {};
  payActionErr.value = null;
}
function payAction () {
  if (paymentLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  paymentLoading.value = true;

  const input = {
    budget: selectedData.value.budget['@id'],
    quantity: selectedData.value.debtQuantity,
    description: 'productCost.payedForMaterialPurchaseDebt #' + selectedData.value.id,
    isIncome: false,
    ripeMaterialPurchase: selectedData.value['@id']
  }

  useBudget().payDebt(input)
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successCreated')
      })
      clearAction();
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => {
      paymentLoading.value = false;
      refresh();
    })
}
function createAction() {
  if (loading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value.ripeMaterial['@id']) {
    console.warn('user or material not found');
    return
  }

  loading.value = true;
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
      ripeMaterial: selectedData.value.ripeMaterial['@id'],
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
        description: `productCost.materialPurchased ${selectedData.value.ripeMaterial.name} - ${selectedData.value.quantity} ${selectedData.value.ripeMaterial.measurement} x ${selectedData.value.price}`,
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
    .finally(() => {
      loading.value = false;
      refresh();
    })
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.ripeMaterialPurchase.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.ripeMaterialPurchase.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            no-caps
            :label="$t('tables.ripeMaterial.buttons.buy')"
            color="primary"
            class="q-mb-md q-mb-sm-none"
            @click="showPurchaseModal = true"
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
          <div v-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'purchasedBy'">
            {{ props.row.purchasedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'ripeMaterial'">
            {{ props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ Number(props.row.quantity) > 0 ? `${formatFloatToInteger(props.row.quantity)} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'quantitySort2'">
            {{ Number(props.row.quantitySort2) > 0 ? `${props.row.quantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'priceSort2'">
            {{ formatFloatToInteger(props.row.priceSort2) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'totalPrice'">
            {{ formatFloatToInteger(props.row.totalPrice) }} {{ props.row.budget.name }}
          </div>
          <div
            v-else-if="col.name === 'paidPrice'"
            :class="Number(props.row.totalPrice) > Number(props.row.paidPrice) ? 'text-red' : 'text-green'"
          >
            {{ formatFloatToInteger(props.row.paidPrice) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.ripeMaterialPurchase.columns.transaction')"
            />
          </div>
          <div
            v-else-if="col.name === 'action' && !props.row.isPayed"
            class="flex justify-end"
          >
            <q-btn
              class="q-px-sm"
              outline
              no-wrap
              dense
              no-caps
              :label="$t('pay')"
              text-color="green"
              icon="mdi-cash"
              @click="showPayModal = true; selectedData = {...props.row}"
            />
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <transaction-list :lists="props.row.transaction" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showPurchaseModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterialPurchase.barCreate') }}</div>
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
            :label="$t('forms.ripeMaterialPurchase.fields.ripeMaterial.label')"
            :store="ripeMaterial"
            fetch-method="fetchRipeMaterials"
            item-label="name"
            :rule-message="$t('forms.ripeMaterialPurchase.fields.ripeMaterial.validation.required')"
            class="col-12"
          />
          <div class="col-12 q-gutter-sm">
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="sort1" label="Sort 1" />
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="sort2" label="Sort 2" />
          </div>
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
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || purchaseLoading"
            :loading="loading || purchaseLoading"
            no-caps
            :label="$t('forms.threadPurchase.buttons.buy')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showPayModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="payAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="payActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterialPurchase.barPayDebt') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="payActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ payActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            v-model.number="selectedData.debtQuantity"
            :prefix="$t('debts') + ': ' + `${(selectedData.totalPrice - selectedData.paidPrice)}`"
            filled
            type="number"
            :label="$t('forms.threadPurchase.fields.debtQuantity.label')"
            :rules="[ val => val && val <= ((selectedData.price * selectedData.quantity) - selectedData.paidPrice) || $t('forms.threadPurchase.fields.debtQuantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || paymentLoading"
            :loading="loading || paymentLoading"
            no-caps
            :label="$t('forms.threadPurchase.buttons.payDebt')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>
