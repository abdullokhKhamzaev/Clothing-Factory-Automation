<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useSale } from "stores/sale.js";
import { useWarehouse } from "stores/warehouse.js";
import { useCustomer } from "stores/customer.js";
import { useAbout } from "stores/user/about.js";
import { useBudget } from "stores/budget.js";
import { formatDate, formatFloatToInteger, isToday } from "src/libraries/constants/defaults.js";
import SelectableList from "components/selectableList.vue";
import SaleList from "components/SaleList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const user = useAbout();
const budget = useBudget();
const customer = useCustomer();
const warehouse = useWarehouse();

const saleLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showPayModal = ref(false);
const payActionErr = ref(null);

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

// Table Data
const repository = useSale();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: route.params.id ? '~' : 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  id: route.params.id,
  customer: '',
  isPayed: null
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchSales({...pagination.value, ...filters.value})
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
function createAction () {
  if (saleLoading.value) return; // Prevent multiple rapid calls

  saleLoading.value = true;

  if (!user.about['@id']) {
    console.warn('user not found');
    return
  }

  let saleProduct = [];

  rows.value.forEach((row) => {
    saleProduct.push({productModel: row.productModel.productModel['@id'], productInWarehouse: row.productInWarehouse, quantities: row.quantities})
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

  repository.create(input)
    .then(() => {
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
      saleLoading.value = false;
      refresh();
    });
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  rows.value = [{ productModel: '', productInWarehouse: '', quantities: [] }];
}
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

  model.productModel.sizes.forEach((size) => {
    sizes.push({ size: size.size, quantity: '', price: size.price});
  });

  models.push({
    productModel: model,
    productInWarehouse: model['@id'],
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
    })
    .catch((res) => {
      payActionErr.value = res.response.data['hydra:description'];
    })
    .finally(() => {
      saleLoading.value = false;
      refresh();
    })
}

const oweByCurrency = computed(() => {
  const map = {};

  if (!items.value) {
    return null
  }

  items.value.forEach((sale) => {
    const total = parseFloat(sale.totalPrice || 0);
    const paid = parseFloat(sale.paidPrice || 0);
    const debt = total - paid;
    const currency = sale.budget?.name || 'Unknown';

    if (!map[currency]) {
      map[currency] = 0;
    }

    map[currency] += debt;
  });

  return Object.entries(map).map(([currency, amount]) => ({
    currency,
    quantity: amount.toFixed(2),
  }));
});
</script>

<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-red">
        {{ $t('oweUs') }}:
      </div>
      <div class="q-ml-sm" v-for="(owe, i) in oweByCurrency" :key="i"> {{ formatFloatToInteger(owe.quantity) }} {{ owe.currency }} <q-separator /> </div>
    </q-card-section>
  </q-card>

  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.sale.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.sale.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <selectable-list
            v-if="!route.params.id"
            v-model="filters.customer"
            dense
            clearable
            :label="$t('tables.users.header.searchTitle')"
            :store="customer"
            fetch-method="fetchCustomers"
            item-value="fullName"
            item-label="fullName"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            @update:model-value="getItems"
          />
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.sale.buttons.add')"
            no-caps
            class="q-mb-md q-mb-sm-none"
            @click="showCreateModal = true"
          />
          <q-toggle
            v-model="filters.isPayed"
            checked-icon="check"
            unchecked-icon="clear"
            :false-value="true"
            :true-value="false"
            :label="$t('debts')"
            @update:model-value="getItems"
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
              {{ formatFloatToInteger((props.row.totalPrice - props.row.paidPrice).toFixed(2)) }} {{ props.row.budget.name }}
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
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="createActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.sale.barCreate') }}</div>
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
              <selectable-list
                v-model="row.productModel"
                :label="$t('forms.sale.fields.productModel.label')"
                :store="warehouse"
                fetch-method="fetchWarehouses"
                which-object="productInWarehouses"
                :filters="{name: 'productsWarehouse'}"
                :item-label="{label: 'productModel', path: 'name'}"
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
            :disable="loading"
            :loading="loading"
            no-caps
            :label="$t('forms.sale.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
        <q-separator/>
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
          <div class="text-h6"> {{ $t('dialogs.sale.barReceiveDebt') }} </div>
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
            :disable="loading || saleLoading"
            :loading="loading || saleLoading"
            no-caps
            :label="$t('forms.sale.buttons.receiveDebt')"
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
