<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useSale } from "stores/sale.js";
import { useWarehouse } from "stores/warehouse.js";
import { useCustomer } from "stores/customer.js";
import { useAbout } from "stores/user/about.js";
import { useBudget } from "stores/budget.js";
import {formatDate, formatFloatToInteger, isToday} from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import SelectableList from "components/selectableList.vue";
import SaleList from "components/SaleList.vue";

// Props
let props = defineProps({
  sales: {
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
const budget = useBudget();
const sale = useSale();
const customer = useCustomer();
const products = ref([]);
const productsLoading = ref(false);

const saleLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showPayModal = ref(false);
const payActionErr = ref(null);
const filters = reactive({
  customer: '',
  isPayed: null
});

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.sale.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'purchasedBy', label: t('tables.sale.columns.purchasedBy'), align: 'left', field: 'purchasedBy' },
  { name: 'purchasedTo', label: t('tables.sale.columns.purchasedTo'), align: 'left', field: 'purchasedTo' },
  { name: 'saleProduct', label: t('tables.sale.columns.saleProduct'), align: 'left', field: 'saleProduct' },
  { name: 'totalPrice', label: t('tables.sale.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'paidPrice', label: t('tables.sale.columns.paidPrice'), align: 'left', field: 'paidPrice' },
  { name: 'debt', label: t('tables.sale.columns.debt'), align: 'left', field: 'debt' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

const rows = ref([
  { productModel: '', productInWarehouse: '', quantities: [] }
])

function addRow() {
  rows.value.push({ productModel: '', productInWarehouse: '', quantities: [] });
}
function removeRow(index) {
  if (rows.value.length > 1) {
    rows.value.splice(index, 1);
  }
}
function getSales () {
  emit('submit', filters);
  getProducts()
}
function getProducts (filterProps) {
  let props = filterProps || {};

  productsLoading.value = true;

  props.name = 'productsWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      products.value = res.data['hydra:member'][0];
    })
    .finally(() => productsLoading.value = false)
}
function createAction () {
  if (saleLoading.value) return; // Prevent multiple rapid calls

  saleLoading.value = true;

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  let saleProduct = [];

  rows.value.forEach((row) => {
    saleProduct.push({productModel: row.productModel.value.productModel['@id'], productInWarehouse: row.productInWarehouse, quantities: row.quantities})
  })

  const input = {
    saleProduct: saleProduct,
    purchasedBy: user.about['@id'],
    totalPrice: String(total.value),
    budget: selectedData.value.budget['@id'],
    paidPrice: selectedData.value.paidPrice,
    customer: selectedData.value.customer['@id'],
    transaction: [{
      paidPrice: selectedData.value.paidPrice,
      createdBy: user.about['@id'],
      isIncome: true,
      description: 'productSold ' + `-> ${selectedData.value.customer.fullName}`,
      budget: selectedData.value.budget['@id'],
      isOldInAndOut: false,
      price: String(total.value)
    }]
  }

  input.isPayed = Number(selectedData.value.paidPrice) === Number(total.value);

  sale.create(input)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.sale.confirmation.successCreated')
      })
      clearAction();
      getSales();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.sale.confirmation.failure')
      })
    })
    .finally(() => saleLoading.value = false);
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  rows.value = [{ productModel: '', productInWarehouse: '', quantities: [] }];
}
const productOptions = computed(() => {
  let options = [];
  for (let i in products.value.productInWarehouses) {
    options.push({
      label: products.value.productInWarehouses[i].productModel.name,
      value: products.value.productInWarehouses[i]
    });
  }
  return options
})
const total = computed(() => {
  let totalPrice = 0;

  rows.value.forEach((row) => {
    row.quantities.forEach((quantity) => {
      const priceInCents = Math.round(quantity.price * 100);
      totalPrice += priceInCents * quantity.quantity;
    })
  })
  return totalPrice / 100
})
function prefill(model, index) {
  let models = [];
  let sizes = [];

  model.value.productModel.sizes.forEach((size) => {
    sizes.push({ size: size.size, quantity: '', price: size.price});
  });

  models.push({
    productModel: model,
    productInWarehouse: model.value['@id'],
    quantities: sizes
  });

  rows.value[index] = models[0]
}
function payAction () {
  if (saleLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  saleLoading.value = true;

  const input = {
    budget: selectedData.value.budget['@id'],
    quantity: selectedData.value.debtQuantity,
    description: 'receivedSaleDebt #' + selectedData.value.id,
    isIncome: true,
    sale: selectedData.value['@id']
  }

  useBudget().payDebt(input, 'aA')
    .then(() => {
      showPayModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successCreated')
      })
      clearAction();
      emit('refresh');
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => saleLoading.value = false)
}
onMounted(() => {
  getProducts();
})
</script>

<template>
  <skeleton-table
    :loading="loading || saleLoading"
  />
  <q-table
    v-show="!props.loading"
    flat
    bordered
    :rows="props.sales"
    :columns="columns"
    :visible-columns="visibleColumns"
    :no-data-label="$t('tables.sale.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.sale.header.title') }}</div>

        <div class="flex items-center justify-between q-my-md">
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
          <div>
            <q-btn
              color="primary"
              icon-right="add"
              :label="$t('tables.sale.buttons.add')"
              no-caps
              @click="showCreateModal = true"
            />
          </div>
        </div>

        <div>
          <selectable-list
            v-model="filters.customer"
            dense
            clearable
            :label="$t('tables.users.header.searchTitle')"
            :store="customer"
            fetch-method="fetchCustomers"
            item-value="fullName"
            item-label="fullName"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            @update:model-value="emit('submit', filters);"
          />
          <q-toggle
            v-model="filters.isPayed"
            checked-icon="check"
            unchecked-icon="clear"
            :false-value="true"
            :true-value="false"
            :label="$t('debts')"
            @update:model-value="emit('submit', filters);"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-1'">
          <div v-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'purchasedBy'">
            {{ props.row.purchasedBy.fullName }}
          </div>
          <div v-else-if="col.name === 'purchasedTo'">
            {{ props.row.customer.fullName }}
          </div>
          <div v-else-if="col.name === 'saleProduct'">
            <div
              v-for="productModel in props.row.saleProduct"
              :key="productModel.id"
            >
              {{ productModel.productModel.name }}:
              <div
                v-for="size in productModel.quantities"
                :key="size"
                class="q-pl-xs text-primary"
              >
                {{ size.size }} : {{ size.quantity }},
              </div>
            </div>
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
          <div v-else-if="col.name === 'debt'" class="text-orange text-bold">
            <div v-if="Number(props.row.totalPrice) - Number(props.row.paidPrice)">
              {{ formatFloatToInteger(Number(props.row.totalPrice) - Number(props.row.paidPrice)) }} {{ props.row.budget.name }}
            </div>
            <div v-else>-</div>
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
          <div v-else-if="col.name === 'action' && !props.row.isPayed" class="flex justify-end">
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
      <q-tr :props="props">
        <q-td colspan="100%">
          <sale-list :lists="props.row.transaction" :saleProduct="props.row.saleProduct" :customer="props.row.customer" :owe-us="Number(props.row.totalPrice) - Number(props.row.paidPrice)" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showCreateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <pre>
        {{ selectedData }}
      </pre>
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.sale.barCreate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="createActionErr">
          <q-separator color="white"/>
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ createActionErr }}
          </div>
          <q-separator color="white"/>
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <selectable-list
            v-model="selectedData.customer"
            :label="$t('forms.sale.fields.customer.label')"
            :store="customer"
            fetch-method="fetchCustomers"
            item-label="fullName"
            :rule-message="$t('forms.sale.fields.customer.validation.required')"
            class="col-12"
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.sale.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-label="name"
            :rule-message="$t('forms.sale.fields.budget.validation.required')"
            class="col-12"
          />
          <div
            v-for="(row, index) in rows" :key="index"
            :class="selectedData.customer ? 'col-12' : 'hidden'"
          >
            <div class="row q-col-gutter-md">
              <div v-if="index" class="col-12 flex items-center">
                <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
              </div>
              <q-select
                v-model="row.productModel"
                filled
                map-options
                :loading="productsLoading"
                :options="productOptions"
                :label="$t('forms.sale.fields.productModel.label')"
                option-value="value"
                option-label="label"
                :rules="[val => !!val || $t('forms.sale.fields.productModel.validation.required')]"
                class="col-12"
                hide-bottom-space
                @update:model-value="prefill(row.productModel, index)"
              />
              <div
                v-for="(row, index) in row.quantities" :key="index"
                class="col-12"
              >
                <div class="row q-col-gutter-md">
                  <q-input
                    filled
                    disable
                    v-model="row.size"
                    :label="$t('forms.sale.fields.size.label')"
                    :rules="[ val => val && val > -1 || $t('forms.sale.fields.size.validation.required')]"
                    class="col-12 col-md-6"
                    hide-bottom-space
                  />
                  <q-input
                    filled
                    type="number"
                    v-model.number="row.quantity"
                    :label="$t('forms.sale.fields.quantity.label')"
                    :rules="[ val => val && val >= 1 || $t('forms.sale.fields.quantity.validation.required')]"
                    class="col-12 col-md-6"
                    hide-bottom-space
                  />
                  <q-input
                    filled
                    type="number"
                    :suffix="selectedData?.budget?.name || null"
                    v-model="row.price"
                    :label="$t('forms.sale.fields.price.label')"
                    :rules="[ val => val && val > 0 || $t('forms.sale.fields.price.validation.required')]"
                    class="col-12 col-md-6"
                    hide-bottom-space
                  />
                </div>
              </div>
              <div class="col-12">
                <q-separator />
              </div>
              <div class="col-12 text-right">
                <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>
              </div>
            </div>
          </div>
          <q-input
            v-model="selectedData.paidPrice"
            type="number"
            filled
            :disable="!selectedData.customer || !selectedData.budget"
            :suffix="selectedData?.budget?.name || null"
            :prefix="selectedData?.budget?.name + ' ' + total + ':'"
            :label="$t('forms.sale.fields.paidPrice.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 && val <= total || $t('forms.sale.fields.paidPrice.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || productsLoading"
            :loading="props.loading || productsLoading"
            no-caps
            :label="$t('forms.sale.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator/>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showPayModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="payAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="payActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.sale.barReceiveDebt') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="payActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ payActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            v-model.number="selectedData.debtQuantity"
            :prefix="$t('debts') + ': ' + `${(selectedData.totalPrice - selectedData.paidPrice).toFixed(2)}`"
            filled
            type="number"
            :label="$t('forms.sale.fields.debtQuantity.label')"
            :rules="[ val => val && val <= (selectedData.totalPrice - selectedData.paidPrice).toFixed(2) || $t('forms.saleLoading.fields.debtQuantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="props.loading || saleLoading"
            :loading="props.loading || saleLoading"
            no-caps
            :label="$t('forms.sale.buttons.receiveDebt')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<style scoped>
</style>
