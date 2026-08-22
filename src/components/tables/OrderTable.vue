<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useOrder } from "stores/order.js";
import { useProductModels } from "stores/productModel.js";
import { useCustomer } from "stores/customer.js";
import { useAbout } from "stores/user/about.js";
import { useBudget } from "stores/budget.js";
import { DATE_FORMAT, formatDate, formatFloatToInteger, roundToDecimal, isToday } from "src/libraries/constants/defaults.js";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const user = useAbout();
const budget = useBudget();
const customer = useCustomer();
const productModels = useProductModels();

const orderLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.order.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.order.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'customer', label: t('tables.order.columns.customer'), align: 'left', field: 'customer' },
  { name: 'products', label: t('tables.order.columns.products'), align: 'left', field: 'products' },
  { name: 'progress', label: t('orderActions.progress'), align: 'left', field: 'progress' },
  { name: 'status', label: t('tables.order.columns.status'), align: 'left', field: 'status' },
  { name: 'totalPrice', label: t('tables.order.columns.totalPrice'), align: 'left', field: 'totalPrice' },
  { name: 'dealDate', label: t('tables.order.columns.dealDate'), align: 'left', field: 'dealDate' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useOrder();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});
const filters = ref({
  customer: '',
  status: ''
});
const rows = ref([
  { productModel: '', quantities: [] }
])

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
function addRow() {
  rows.value.push({ productModel: '', quantities: [] });
}
function removeRow(index) {
  if (rows.value.length > 1) {
    rows.value.splice(index, 1);
  }
}
function createAction () {
  if (orderLoading.value) return; // Prevent multiple rapid calls
  orderLoading.value = true;

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  let orderedProducts = [];

  rows.value.forEach((row) => {
    orderedProducts.push({productModel: row.productModel['@id'], quantities: row.quantities})
  })

  const input = {
    customer: selectedData.value.customer,
    products: orderedProducts,
    totalPrice: String(total.value),
    budget: selectedData.value.budget['@id'],
    createdBy: user.about['@id'],
    dealDate: selectedData.value.dealDate,
  }

  // Oldindan to'lov (avans): buyurtmada saqlanadi va kassaga kirim yoziladi
  const advance = roundToDecimal(Number(selectedData.value.advancePrice || 0));
  if (advance > 0) {
    input.advancePrice = String(advance);
    input.advanceRemainder = String(advance);
  }

  repository.create(input)
    .then((res) => {
      if (advance > 0) {
        budget.add({
          budget: selectedData.value.budget['@id'],
          quantity: advance,
          description: 'orderAdvance #' + (res?.data?.id || ''),
          isIncome: true,
        });
      }

      showCreateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.sale.confirmation.successCreated')
      })
      clearAction();
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
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  rows.value = [{ productModel: '', quantities: [] }];
}
function prefill(model, index) {
  let sizes = [];

  (model.sizes || []).forEach((size) => {
    sizes.push({ size: size.size, quantity: '', price: size.price});
  });

  rows.value[index] = {
    productModel: model,
    quantities: sizes
  };
}

const total = computed(() => {
  let totalPrice = 0
  rows.value.forEach((row) => {
    row.quantities.forEach((quantity) => {
      totalPrice += quantity.price * quantity.quantity;
    })
  })
  return totalPrice
})

// Buyurtmadagi jami so'ralgan dona
function demandOf(row) {
  let totalQuantity = 0;
  (row.products || []).forEach((product) => {
    (product.quantities || []).forEach((quantity) => {
      totalQuantity += quantity.quantity || 0;
    });
  });
  return totalQuantity;
}

function deliveryPct(row) {
  const demand = demandOf(row);
  if (!demand) return 0;
  return Math.round((row.deliveredQuantity || 0) / demand * 100);
}

function deliveryRatio(row) {
  return Math.min(deliveryPct(row) / 100, 1);
}

function setStatus(row, status) {
  if (orderLoading.value) return;
  orderLoading.value = true;

  repository.update(row.id, { status })
    .then(() => {
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('statuses.' + status)
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh();
    });
}

onMounted(() => {
  refresh();
})
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
        <div class="q-table__title">{{ $t('tables.order.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.order.buttons.add')"
            no-caps
            class="q-mb-md q-mb-sm-none"
            @click="showCreateModal = true"
          />
          <selectable-list
            v-model="filters.customer"
            dense
            clearable
            :label="$t('tables.users.header.searchTitle')"
            :store="customer"
            fetch-method="fetchCustomers"
            item-value="fullName"
            item-label="fullName"
            @update:model-value="onRequest"
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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green-2 text-black'">
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
              class="q-mb-xs"
            >
              <div class="text-weight-medium">{{ model.productModel?.name || '—' }}</div>
              <div
                v-for="size in model.quantities"
                :key="size.size"
                class="q-pl-sm text-primary"
              >
                {{ size.size }} : {{ size.quantity }}
              </div>
            </div>
          </div>
          <div v-else-if="col.name === 'totalPrice'">
            {{ formatFloatToInteger(props.row.totalPrice) }} {{ props.row.budget.name }}
            <div v-if="parseFloat(props.row.advancePrice) > 0" class="text-caption text-green">
              {{ $t('orderActions.advanceShort') }}: {{ formatFloatToInteger(props.row.advancePrice) }}
              ({{ $t('orderActions.advanceRemainderShort') }}: {{ formatFloatToInteger(props.row.advanceRemainder) }})
            </div>
          </div>
          <div v-else-if="col.name === 'progress'">
            <div class="text-bold no-wrap">
              {{ formatFloatToInteger(props.row.deliveredQuantity || 0) }} / {{ formatFloatToInteger(demandOf(props.row)) }}
              <q-badge v-if="deliveryPct(props.row) >= 100" color="green" class="q-ml-xs">{{ $t('orderActions.fullyDelivered') }}</q-badge>
              <q-badge v-else color="primary" class="q-ml-xs">{{ deliveryPct(props.row) }}%</q-badge>
            </div>
            <q-linear-progress
              :value="deliveryRatio(props.row)"
              size="6px"
              rounded
              :color="deliveryPct(props.row) >= 100 ? 'green' : 'primary'"
              track-color="grey-4"
              class="q-mt-xs"
              style="min-width: 90px"
            />
          </div>
          <div v-else-if="col.name === 'status'">
            <span
              v-if="props.row.status === 'delivered' && deliveryPct(props.row) < 100"
              class="text-bold text-orange"
            >
              {{ $t('orderActions.closedPartial') }}
            </span>
            <span
              v-else
              class="text-bold"
              :class="props.row.status === 'pending' ? 'text-warning' : props.row.status === 'cancelled' ? 'text-red' : 'text-green'"
            >
              {{ $t('statuses.' + props.row.status) }}
            </span>
          </div>
          <div v-else-if="col.name === 'action'">
            <div v-if="['pending', 'delivering'].includes(props.row.status)" class="flex justify-end no-wrap q-gutter-x-sm">
              <q-btn dense no-caps color="green" icon-right="mdi-check-all" :disable="orderLoading">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('orderActions.close') }}
                </q-tooltip>
                <q-popup-proxy>
                  <q-banner class="q-pa-md">
                    {{ $t('orderActions.closeConfirm') }}
                    <div class="text-bold q-mt-xs" :class="deliveryPct(props.row) < 100 ? 'text-orange' : 'text-green'">
                      {{ $t('orderActions.deliveredSoFar') }}: {{ formatFloatToInteger(props.row.deliveredQuantity || 0) }} / {{ formatFloatToInteger(demandOf(props.row)) }} ({{ deliveryPct(props.row) }}%)
                    </div>
                    <template v-slot:action>
                      <q-btn flat dense color="green" :label="$t('orderActions.close')" v-close-popup @click="setStatus(props.row, 'delivered')" />
                    </template>
                  </q-banner>
                </q-popup-proxy>
              </q-btn>
              <q-btn dense no-caps color="red" icon-right="mdi-cancel" :disable="orderLoading">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('orderActions.cancel') }}
                </q-tooltip>
                <q-popup-proxy>
                  <q-banner class="q-pa-md">
                    {{ $t('orderActions.cancelConfirm') }}
                    <div class="text-bold q-mt-xs text-orange">
                      {{ $t('orderActions.deliveredSoFar') }}: {{ formatFloatToInteger(props.row.deliveredQuantity || 0) }} / {{ formatFloatToInteger(demandOf(props.row)) }} ({{ deliveryPct(props.row) }}%)
                    </div>
                    <template v-slot:action>
                      <q-btn flat dense color="red" :label="$t('orderActions.cancel')" v-close-popup @click="setStatus(props.row, 'cancelled')" />
                    </template>
                  </q-banner>
                </q-popup-proxy>
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

  <!-- Dialogs -->
  <q-dialog v-model="showCreateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('orderActions.createTitle') }}</div>
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
          <q-separator/>
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
              <selectable-list
                v-model="row.productModel"
                :label="$t('forms.sale.fields.productModel.label')"
                :store="productModels"
                fetch-method="fetchProductModels"
                item-label="name"
                :rule-message="$t('forms.sale.fields.productModel.validation.required')"
                class="col-12"
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
          <div v-if="selectedData.customer && selectedData.budget" class="col-12 text-h6 text-bold text-primary">
            {{ $t('orderActions.total') }}: {{ formatFloatToInteger(total) }} {{ selectedData?.budget?.name || '' }}
          </div>
          <q-input
            v-if="selectedData.customer && selectedData.budget"
            v-model.number="selectedData.advancePrice"
            type="number"
            filled
            :suffix="selectedData?.budget?.name || null"
            :label="$t('orderActions.advance')"
            :rules="[val => val === undefined || val === null || val === '' || (val >= 0 && val <= total) || $t('orderActions.advance')]"
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
            :disable="loading"
            :loading="loading"
            no-caps
            :label="$t('orderActions.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator/>
      </q-form>
    </q-card>
  </q-dialog>
</template>
