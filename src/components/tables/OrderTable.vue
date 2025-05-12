<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useOrder } from "stores/order.js";
import { useWarehouse } from "stores/warehouse.js";
import { useCustomer } from "stores/customer.js";
import { useAbout } from "stores/user/about.js";
import { useBudget } from "stores/budget.js";
import { DATE_FORMAT, formatDate, formatFloatToInteger, isToday, LANGUAGES } from "src/libraries/constants/defaults.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
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
const user = useAbout();
const budget = useBudget();
const order = useOrder();
const customer = useCustomer();
const products = ref([]);
const productsLoading = ref(false);

const orderLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const filters = reactive({
  customer: '',
  status: ''
});

const visibleColumns = ref(['id', 'createdAt', 'createdBy', 'customer', 'products', 'status', 'totalPrice', 'dealDate'])
const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.order.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.order.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'customer', label: t('tables.order.columns.customer'), align: 'left', field: 'customer' },
  { name: 'products', label: t('tables.order.columns.products'), align: 'left', field: 'products' },
  { name: 'status', label: t('tables.order.columns.status'), align: 'left', field: 'status' },
  { name: 'totalPrice', label: t('tables.order.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'dealDate', label: t('tables.order.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];

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
function getOrders () {
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
  orderLoading.value = true;

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  let orderedProducts = [];

  rows.value.forEach((row) => {
    orderedProducts.push({productModel: row.productModel.value.productModel['@id'], productInWarehouse: row.productInWarehouse, quantities: row.quantities})
  })

  const input = {
    customer: selectedData.value.customer,
    products: orderedProducts,
    totalPrice: String(total.value),
    budget: selectedData.value.budget['@id'],
    createdBy: user.about['@id'],
    dealDate: selectedData.value.dealDate,
  }

  order.create(input)
    .then(() => {
      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.sale.confirmation.successCreated')
      })
      clearAction();
      getOrders();
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
    .finally(() => orderLoading.value = false);
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
  let totalPrice = 0
  rows.value.forEach((row) => {
    row.quantities.forEach((quantity) => {
      totalPrice += quantity.price * quantity.quantity;
    })
  })
  return totalPrice
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
onMounted(() => {
  getProducts();
})
</script>

<template>
  <skeleton-table
    :loading="loading || orderLoading"
  />

  <q-table
    v-show="!props.loading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :visible-columns="visibleColumns"
    :no-data-label="$t('tables.order.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12">
        <div class="q-table__title">{{ $t('tables.order.header.title') }}</div>

        <div class="flex justify-between q-my-md">
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
              :label="$t('tables.order.buttons.add')"
              no-caps
              @click="showCreateModal = true"
            />
          </div>
        </div>

        <div class="q-gutter-y-md q-mt-md">
          <selectable-list
            v-model="filters.customer"
            dense
            clearable
            :label="$t('tables.users.header.searchTitle')"
            :store="customer"
            fetch-method="fetchCustomers"
            item-value="fullName"
            item-label="fullName"
            @update:model-value="emit('submit', filters);"
          />

          <q-select
            v-model="filters.status"
            :options="LANGUAGES"
            :label="$t('tables.order.columns.status')"
            dense
            filled
            emit-value
            map-options
            option-value="value"
            option-label="label"
            hide-bottom-space
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
          <div v-else-if="col.name === 'dealDate'">
            {{ formatDate(props.row.dealDate) }}
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row.createdBy.fullName }}
          </div>
          <div v-else-if="col.name === 'customer'">
            {{ props.row.customer.fullName }}
          </div>
          <div v-else-if="col.name === 'products'">
            <div
              v-for="model in props.row.products"
              :key="model.id"
            >
              <div
                v-for="size in model.quantities"
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
          <div v-else-if="col.name === 'status'">
            <span class="text-bold" :class="props.row.status === 'pending' ? 'text-warning' : 'text-green'">
              {{ $t('statuses.' + props.row.status) }}
            </span>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
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
            item-value="@id"
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
          <q-input
            filled
            v-model="selectedData.dealDate"
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
</template>

<style scoped>
</style>
