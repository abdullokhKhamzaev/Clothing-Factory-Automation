<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { WAREHOUSES } from "src/libraries/constants/defaults.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import ProductInWarehouseAction from "components/tables/ProductInWarehouseAction.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const selectedData = ref({});
const defectActionErr = ref(false);
const reportActionErr = ref(false);
const showDefectModal = ref(false);
const showReportModal = ref(false);
const rows = ref([{ size: '', quantity: '', max: '' }]);
const warehouse = ref([]);

const loading = ref(false);
function getWarehouse (filterProps) {
  let props = filterProps || {};

  loading.value = true;

  props.name = 'sewerWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
      loading.value = false;
    })
}
function prefill() {
  let sizes = [];
  selectedData.value.productSize.forEach((size) => {
    sizes.push({ size: size.size, quantity: '', max: size.quantity });
  });
  rows.value = sizes;
}
function defectAction() {
  if (!user.about['@id'] || !selectedData.value['@id'] || !warehouse.value['@id']) {
    console.warn('data not found');
    return
  }

  loading.value = true;

  let productSize = [];

  rows.value.forEach((product) => {
    productSize.push({ size: product.size, quantity: product.quantity })
  })

  let input = {
    productModel: selectedData.value.productModel['@id'],
    productSize: productSize,
    fromWarehouse: warehouse.value['@id'],
    toWarehouse: WAREHOUSES.cutterWarehouseDefective,
    sentBy: user.about['@id'],
    isDefective: true
  };

  useProductWarehouse().send(input)
    .then(() => {
      showDefectModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successSent')
      })
      clearAction();
    })
    .catch((res) => {
      defectActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.failureSent')
      })
    })
    .finally(() => {
      loading.value = false;
      refresh();
    })
}
function reportAction() {
  if (!user.about['@id'] || !selectedData.value['@id'] || !warehouse.value['@id']) {
    console.warn('data not found');
    return
  }

  loading.value = true;

  let productSize = [];

  rows.value.forEach((product) => {
    productSize.push({ size: product.size, quantity: product.quantity })
  })

  let input = {
    productModel: selectedData.value.productModel['@id'],
    productSize: productSize,
    fromWarehouse: warehouse.value['@id'],
    toWarehouse: WAREHOUSES.packagerWarehouse,
    sentBy: user.about['@id'],
    isDefective: false,
    isReady: true
  };

  useProductWarehouse().send(input)
    .then(() => {
      showReportModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.successSent')
      })
      clearAction();
    })
    .catch((res) => {
      reportActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.ripeMaterialPurchase.confirmation.failureSent')
      })
    })
    .finally(() => {
      loading.value = false;
      refresh();
    })
}
function clearAction() {
  selectedData.value = {};
  defectActionErr.value = null;
  reportActionErr.value = null;
  rows.value = [{ size: '', quantity: '', max: '' }];
}
function refresh() {
  getWarehouse();
}

const searchTitle = ref();
const filteredProducts = computed(() => {
  if (!searchTitle.value) {
    return warehouse.value.productInWarehouses || [];
  }

  return (warehouse.value.productInWarehouses || []).filter(item =>
    item.productModel.name.toLowerCase().includes(searchTitle.value.toLowerCase())
  );
});
const filters = {
  toWarehouses: [WAREHOUSES.sewerWarehouse, WAREHOUSES.packagerWarehouse]
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <ProductInWarehouseAction
    :filters="filters"
    :title="t('tables.warehouseAction.header.title')"
  />

  <h4 class="q-mb-sm">
    {{ $t('tables.model.header.title') }}
  </h4>
  <q-list
    v-show="!loading"
    bordered
    separator
    class="q-mb-md shadow-3"
  >
    <q-input
      style="min-width: 225px"
      dense
      clearable
      v-model="searchTitle"
      class="q-mx-md"
      :label="$t('tables.users.header.searchTitle')"
    >
      <template v-slot:append>
        <q-icon name="search" color="primary" />
      </template>
    </q-input>
    <q-item v-if="!filteredProducts.length">
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">{{ $t('productNotFound') }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      v-for="(item, index) in filteredProducts"
      :key="item"
    >
      <q-item-section>
        <q-item-label class="text-subtitle1 text-weight-bold">{{ item.productModel.name }}</q-item-label>
        <q-item-label caption>
          <span
            v-for="size in item.productSize"
            :key="size"
            class="q-pl-xs text-primary text-subtitle2 text-weight-bold"
          >
            {{ size.size }} : {{ size.quantity }} {{ warehouse.productInWarehouses.length !== index ? '' : ',' }}
          </span>
        </q-item-label>
      </q-item-section>
      <q-item-section>
        <div class="flex justify-end">
          <q-btn
            color="primary"
            icon="mdi-dots-vertical"
            size="sm"
            round
          >
            <q-menu>
              <q-card>
                <q-item
                  v-close-popup
                  class="text-red"
                  clickable
                  @click="selectedData = {...item}; prefill(); showDefectModal = true;"
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="mdi-cube-send"
                      color="red"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('sendToCutterDefective') }}
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  v-close-popup
                  class="text-primary"
                  clickable
                  @click="selectedData = {...item}; prefill(); showReportModal = true;"
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="mdi-cube-send"
                      color="primary"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('report') }}
                  </q-item-section>
                </q-item>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>
  </q-list>

  <!-- Dialogs -->
  <q-dialog v-model="showDefectModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="defectAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="defectActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterial.barSend') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="defectActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ defectActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            disable
            v-model="selectedData.productModel.name"
            filled
            lazy-rules
            :rules="[ val => val && val >= 1 && val <= Number(selectedData.quantity) || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-mb-lg"
        >
          <q-input
            filled
            disable
            v-model="row.size"
            :label="$t('forms.modelOrder.fields.size.label')"
            :rules="[ val => val && val > 0 || $t('forms.modelOrder.fields.size.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            :prefix="`max: ${row.max}`"
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
            :rules="[ val => val !== undefined && val <= Number(row.max) || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading"
            :loading="loading"
            no-caps
            :label="$t('forms.ripeMaterialPurchase.buttons.send')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showReportModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="reportAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="reportActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.completedMaterialOrderReport.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="reportActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ reportActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            disable
            v-model="selectedData.productModel.name"
            filled
            lazy-rules
            :rules="[ val => val && val >= 1 && val <= Number(selectedData.quantity) || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-mb-lg"
        >
          <q-input
            filled
            disable
            v-model="row.size"
            :label="$t('forms.modelOrder.fields.size.label')"
            :rules="[ val => val && val > 0 || $t('forms.modelOrder.fields.size.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            :prefix="`max: ${row.max}`"
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.label')"
            :rules="[ val => val !== undefined && val <= Number(row.max) || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
            class="col-12 col-md-6"
            hide-bottom-space
          />
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading"
            :loading="loading"
            no-caps
            :label="$t('forms.ripeMaterialPurchase.buttons.send')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>
