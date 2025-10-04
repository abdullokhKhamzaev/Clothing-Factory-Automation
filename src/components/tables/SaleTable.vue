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

const showAllItems = ref(route.params.id ? true : false);

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

function setPaymentFilter(value) {
  filters.value.isPayed = value;
  pagination.value.page = 1;
  getItems();
}

function toggleShowAll() {
  showAllItems.value = !showAllItems.value;
  if (showAllItems.value) {
    pagination.value.rowsPerPage = '~'; // '~' means show all in API Platform
  } else {
    pagination.value.rowsPerPage = 10; // Back to default pagination
  }
  pagination.value.page = 1;
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
    description: 'receivedSaleDebt #' + selectedData.value.id + ' from ' + selectedData.value.customer.fullName,
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
  <!-- Summary Cards -->
  <q-card flat bordered>
    <q-card-section class="q-pa-md">
      <div class="row items-center q-col-gutter-md">
        <q-icon name="mdi-cash-multiple" size="32px" color="red" />
        <div>
          <div class="text-caption text-grey-7 text-uppercase">{{ $t('oweUs') }}</div>
          <div class="q-mt-xs">
            <div v-for="(owe, i) in oweByCurrency" :key="i" class="q-mr-md">
              <div class="text-h6 text-weight-bold text-red">
                {{ formatFloatToInteger(owe.quantity) }}
                <span class="text-body2 text-grey-7 q-ml-xs">{{ owe.currency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>

  <!-- Main Content Card -->
  <q-card flat bordered>
    <q-card-section class="q-pa-none">
      <!-- Toolbar -->
      <div class="q-pa-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 flex justify-between">
            <div class="text-h6 text-weight-bold">{{ $t('tables.sale.header.title') }}</div>
            <q-btn
              unelevated
              color="primary"
              :label="$t('tables.sale.buttons.add')"
              no-caps
              @click="showCreateModal = true"
            />
          </div>
          <div class="col-12">
            <div class="flex q-gutter-md">
              <selectable-list
                v-if="!route.params.id"
                v-model="filters.customer"
                dense
                outlined
                clearable
                :label="$t('tables.users.header.searchTitle')"
                :store="customer"
                fetch-method="fetchCustomers"
                item-value="fullName"
                item-label="fullName"
                @update:model-value="getItems"
              />
              <q-btn
                :outline="!showAllItems"
                :unelevated="showAllItems"
                :color="showAllItems ? 'secondary' : 'grey-7'"
                icon="mdi-view-list"
                no-caps
                @click="toggleShowAll"
              >
                <template v-if="showAllItems">
                  {{ $t('all') }} ({{ items.length }})
                </template>
                <template v-else>
                  {{ $t('all') }}
                </template>
                <q-tooltip>
                  <template v-if="showAllItems">
                    {{ $t('tables.sale.tooltip.clickToEnablePagination') }}
                  </template>
                  <template v-else>
                    {{ $t('tables.sale.tooltip.clickToShowAll') }}
                  </template>
                </q-tooltip>
              </q-btn>
              <q-btn-group outline>
                <q-btn
                  :outline="filters.isPayed !== null"
                  :unelevated="filters.isPayed === null"
                  color="primary"
                  :label="$t('all')"
                  no-caps
                  @click="setPaymentFilter(null)"
                />
                <q-btn
                  :outline="filters.isPayed !== true"
                  :unelevated="filters.isPayed === true"
                  color="green"
                  icon="check_circle"
                  :label="$t('paid')"
                  no-caps
                  @click="setPaymentFilter(true)"
                />
                <q-btn
                  :outline="filters.isPayed !== false"
                  :unelevated="filters.isPayed === false"
                  color="orange"
                  icon="pending"
                  :label="$t('debts')"
                  no-caps
                  @click="setPaymentFilter(false)"
                />
              </q-btn-group>
              <refresh-button :action="refresh" />
            </div>
          </div>
        </div>
      </div>

      <q-separator />

      <!-- Sales List -->
      <q-list separator>
        <!-- Loading Skeletons -->
        <template v-if="loading">
          <q-item v-for="i in 5" :key="i" class="q-pa-md">
            <q-item-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-8">
                  <q-skeleton type="text" width="30%" />
                  <q-skeleton type="text" width="50%" class="q-mt-sm" />
                  <q-skeleton type="rect" height="80px" class="q-mt-md" />
                </div>
                <div class="col-12 col-md-4">
                  <q-skeleton type="rect" height="180px" />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </template>

        <!-- Empty State -->
        <template v-else-if="!items.length">
          <q-item>
            <q-item-section class="text-center text-grey-6 q-py-xl">
              <div>
                <q-icon name="mdi-package-variant" size="64px" />
              </div>
              <div class="text-h6 q-mt-md">{{ $t('tables.sale.header.empty') }}</div>
            </q-item-section>
          </q-item>
        </template>

        <!-- Sale Items -->
        <q-item
          v-else
          v-for="sale in items"
          :key="sale.id"
          class="q-pa-md"
          :class="isToday(sale.createdAt) ? 'bg-light-green-1' : ''"
        >
          <q-item-section>
            <div class="row q-col-gutter-md">
              <!-- Left Column: Sale Info -->
              <div class="col-12 col-md-8">
                <div class="row items-center q-mb-sm">
                  <div class="col-auto">
                    <q-chip
                      size="sm"
                      color="grey-3"
                      text-color="grey-8"
                      :label="'#' + sale.id"
                    />
                  </div>
                  <div class="col-auto">
                    <q-chip
                      size="sm"
                      :color="sale.isPayed ? 'green-2' : 'orange-2'"
                      :text-color="sale.isPayed ? 'green-9' : 'orange-9'"
                      :icon="sale.isPayed ? 'check_circle' : 'pending'"
                      :label="sale.isPayed ? $t('paid') : $t('debts')"
                    />
                  </div>
                  <div class="col-auto text-caption text-grey-7">
                    {{ formatDate(sale.createdAt) }}
                  </div>
                </div>

                <!-- Customer & Seller Info -->
                <div class="row items-center q-mb-sm q-gutter-sm">
                  <div class="col-auto">
                    <q-icon name="mdi-account" size="20px" color="primary" />
                  </div>
                  <div class="col-auto text-body2 text-weight-medium">
                    {{ sale.customer.fullName }}
                  </div>
                  <div class="col-auto text-caption text-grey-6">
                    {{ $t('tables.sale.columns.purchasedBy') }}: {{ sale.purchasedBy.fullName }}
                  </div>
                </div>

                <!-- Products -->
                <div class="q-mt-sm">
                  <div class="text-caption text-grey-7 q-mb-xs">{{ $t('tables.sale.columns.saleProduct') }}:</div>
                  <q-card
                      v-for="productModel in sale.saleProduct"
                      :key="productModel.id"
                      flat
                      bordered
                      class="q-mb-sm"
                    >
                      <q-card-section class="q-pa-sm">
                        <div class="text-weight-medium text-body2 q-mb-sm">{{ productModel.productModel.name }}</div>
                        <div
                          v-for="size in productModel.quantities"
                          :key="size.size"
                          class="flex q-gutter-sm"
                        >
                          <q-badge outline color="primary" :label="size.size" />
                          <div>
                            {{ size.quantity }} × {{ formatFloatToInteger(size.price) }}
                          </div>
                          <div class="text-weight-bold text-primary q-ml-auto">
                            {{ formatFloatToInteger((size.quantity * size.price).toFixed(2)) }} {{ sale.budget.name }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                </div>
              </div>

              <!-- Right Column: Price Info & Actions -->
              <div class="col-12 col-md-4">
                <q-card flat bordered class="full-height">
                  <q-card-section class="q-pa-md">
                    <!-- Total Price -->
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-7">{{ $t('tables.sale.columns.totalPrice') }}</div>
                      <div class="text-h6 text-weight-bold text-primary">
                        {{ formatFloatToInteger(sale.totalPrice) }}
                        <span class="text-body2 text-grey-7">{{ sale.budget.name }}</span>
                      </div>
                    </div>

                    <!-- Paid Price -->
                    <div class="q-mb-md">
                      <div class="text-caption text-grey-7">{{ $t('tables.sale.columns.paidPrice') }}</div>
                      <div
                        class="text-h6 text-weight-bold"
                        :class="Number(sale.totalPrice) > Number(sale.paidPrice) ? 'text-orange-8' : 'text-green-8'"
                      >
                        {{ formatFloatToInteger(sale.paidPrice) }}
                        <span class="text-body2 text-grey-7">{{ sale.budget.name }}</span>
                      </div>
                    </div>

                    <!-- Debt -->
                    <div v-if="Number(sale.totalPrice) - Number(sale.paidPrice)" class="q-mb-md">
                      <div class="text-caption text-grey-7">{{ $t('tables.sale.columns.debt') }}</div>
                      <div class="text-h6 text-weight-bold text-red">
                        {{ formatFloatToInteger((sale.totalPrice - sale.paidPrice).toFixed(2)) }}
                        <span class="text-body2 text-grey-7">{{ sale.budget.name }}</span>
                      </div>
                    </div>

                    <q-separator class="q-my-md" v-if="!sale.isPayed" />

                    <!-- Pay Button -->
                    <q-btn
                      v-if="!sale.isPayed"
                      unelevated
                      color="green"
                      icon="mdi-cash"
                      :label="$t('pay')"
                      no-caps
                      class="full-width"
                      @click="showPayModal = true; selectedData = {...sale}"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Expandable Transaction Details -->
            <q-expansion-item
              v-if="sale.transaction && sale.transaction.length"
              class="q-mt-md"
              icon="mdi-receipt-text"
              :label="$t('tables.ripeMaterialPurchase.columns.transaction') + ' (' + sale.transaction.length + ')'"
              header-class="bg-grey-2 text-grey-8"
            >
              <q-card flat bordered class="q-mt-sm">
                <q-card-section>
                  <sale-list
                    :lists="sale.transaction"
                    :saleProduct="sale.saleProduct"
                    :customer="sale.customer"
                    :owe-us="Number(sale.totalPrice) - Number(sale.paidPrice)"
                  />
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Pagination -->
      <template v-if="!showAllItems && items.length > 0 && pagination.rowsPerPage !== '~'">
        <q-separator />
        <div class="q-pa-md">
          <div class="row items-center justify-between">
            <div class="col-auto text-caption text-grey-7">
              {{ $t('tables.sale.pagination.showing') }} {{ ((pagination.page - 1) * pagination.rowsPerPage) + 1 }} -
              {{ Math.min(pagination.page * pagination.rowsPerPage, pagination.rowsNumber) }}
              {{ $t('tables.sale.pagination.of') }} {{ pagination.rowsNumber }}
            </div>
            <div class="col-auto">
              <q-pagination
                v-model="pagination.page"
                :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                :max-pages="7"
                boundary-numbers
                direction-links
                @update:model-value="onRequest({pagination: pagination})"
              />
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="showAllItems && items.length > 0">
        <q-separator />
        <div class="q-pa-md text-center text-caption text-grey-7">
          {{ $t('tables.sale.pagination.showingAllItems') }}: {{ items.length }}
        </div>
      </template>
    </q-card-section>
  </q-card>

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
