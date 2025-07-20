<script setup>
import {onMounted, ref} from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { formatFloatToInteger } from "../../libraries/constants/defaults.js";
import { useAccessory } from "stores/accessory.js";
import { useBudget } from "stores/budget.js";
import { useAbout } from "stores/user/about.js";
import { useAccessoryPurchase } from "stores/accessoryPurchase.js";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const domain = ref(import.meta.env.VITE_API_DOMEN);
const $q = useQuasar();
const { t } = useI18n();

const budget = useBudget();
const user = useAbout();

const selectedData = ref({});
const showPurchaseModal = ref(false);
const purchaseLoading = ref(false);
const createActionErr = ref(null);

const columns = [
  { name: 'name', label: t('tables.accessory.columns.name'), align: 'left', field: 'name' },
  { name: 'image', label: t('tables.accessory.columns.image'), align: 'left', field: 'image' },
  { name: 'quantity', label: t('tables.accessory.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'price', label: t('tables.accessory.columns.price'), align: 'left', field: 'price' },
  { name: 'type', label: t('tables.accessory.columns.type'), align: 'left', field: 'type' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useAccessory();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  types: ['cutter', 'embroidery', 'sewer', 'packager', 'warehouse']
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchAccessories({...pagination.value, ...filters.value})
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

function createAction() {
  if (purchaseLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value.accessory['@id']) {
    console.warn('user or accessory not found');
    return
  }

  purchaseLoading.value = true;

  let input = {
    accessory: selectedData.value.accessory['@id'],
    quantity: selectedData.value.quantity,
    price: selectedData.value.price,
    totalPrice: String(selectedData.value.quantity * selectedData.value.price),
    budget: selectedData.value.budget,
    paidPrice: selectedData.value.paidPrice,
    purchasedBy: user.about['@id'],
    transaction: [{
      paidPrice: selectedData.value.paidPrice,
      createdBy: user.about['@id'],
      isIncome: false,
      description: `accessoryPurchased ${selectedData.value.accessory.name} - ${selectedData.value.quantity} ${selectedData.value.accessory.measurement} x ${selectedData.value.price}`,
      budget: selectedData.value.budget,
      isOldInAndOut: false,
      price: String(selectedData.value.quantity * selectedData.value.price)
    }]
  }

  input.isPayed = Number(selectedData.value.paidPrice) === Number(selectedData.value.quantity * selectedData.value.price);

  useAccessoryPurchase().createPurchase(input)
    .then(() => {
      showPurchaseModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.accessoryPurchase.confirmation.successBought')
      })
      clearAction();
    })
    .catch((res) => {
      createActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.accessoryPurchase.confirmation.failure')
      })
    })
    .finally(() => {
      purchaseLoading.value = false;
      refresh();
    })
}
function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.accessory.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.accessory.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.accessory.buttons.purchase')"
            no-caps
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
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div
            v-if="col.name === 'quantity'"
            class="flex no-wrap q-gutter-sm"
          >
            <span> {{ formatFloatToInteger(props.row.quantity) }} </span>
            <span class="text-weight-bolder"> ({{ $t(props.row.measurement) }}) </span>
          </div>
          <div v-else-if="col.name === 'price'">
            {{ formatFloatToInteger(props.row.price) }}
          </div>
          <div v-else-if="col.name === 'image'">
            <q-img
              v-if="props?.row?.image?.contentUrl"
              :src="domain + props.row.image.contentUrl"
              style="max-width: 50px"
            />
            <div v-else>
              -
            </div>
          </div>
          <div v-else-if="col.name === 'type'">
            {{ $t(props.row.type) }}
          </div>
          <div v-else>
            {{ props.row[col.field] }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showPurchaseModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.accessoryPurchase.barCreate') }}</div>
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
          <selectable-list
            v-model="selectedData.accessory"
            :label="$t('forms.accessoryPurchase.fields.accessory.label')"
            :store="repository"
            fetch-method="fetchAccessories"
            :methodProps="{types: ['cutter', 'embroidery', 'sewer', 'packager', 'warehouse']}"
            item-label="name"
            :rule-message="$t('forms.accessoryPurchase.fields.accessory.validation.required')"
            class="col-12"
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.accessoryPurchase.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.accessoryPurchase.fields.budget.validation.required')"
            class="col-12"
          />
          <q-input
            v-model="selectedData.quantity"
            type="number"
            filled
            :disable="!selectedData.accessory"
            :label="$t('forms.accessoryPurchase.fields.quantity.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.accessoryPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.price"
            type="number"
            filled
            :disable="!selectedData.budget || !selectedData.accessory || !selectedData.quantity > 0"
            :prefix="selectedData?.budget === '/api/budgets/1' ? 'so\'m:' : '$:'"
            :label="$t('forms.accessoryPurchase.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.accessoryPurchase.fields.price.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model="selectedData.paidPrice"
            type="number"
            filled
            :disable="!selectedData.price || !selectedData.budget || !selectedData.accessory || !selectedData.quantity > 0"
            :prefix="selectedData?.budget === '/api/budgets/1' ? `${selectedData.quantity * selectedData.price} so'm ${$t('from')}` : `${selectedData.quantity * selectedData.price} $ ${$t('from')}`"
            :label="$t('forms.accessoryPurchase.fields.paidPrice.label')"
            lazy-rules
            :rules="[ val => val && val >= 0 && val <= Number(selectedData.quantity * selectedData.price) || $t('forms.accessoryPurchase.fields.paidPrice.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || purchaseLoading"
            :loading="loading || purchaseLoading"
            no-caps
            :label="$t('forms.accessoryPurchase.buttons.buy')"
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
