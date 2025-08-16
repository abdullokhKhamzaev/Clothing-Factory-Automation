<script setup>
import { computed, onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useWarehouse } from "stores/warehouse.js";
import { useAbout } from "stores/user/about.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { WAREHOUSES } from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";
import {useProductInWarehouse} from "stores/productInWarehouse.js";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  canUpdate: {
    type: Boolean,
    required: false,
    default: false,
  },
  showAction: {
    type: Boolean,
    required: false,
    default: false,
  },
  checkEmbroidery: {
    type: Boolean,
    required: false,
    default: false,
  },
  fromWarehouse: {
    type: String,
    required: false,
    default: null
  },
  canSendToDefect: {
    type: Boolean,
    required: false,
    default: false
  },
  canSendToEmbroidery: {
    type: Boolean,
    required: false,
    default: false
  },
  canSendToSew: {
    type: Boolean,
    required: false,
    default: false
  },
  canSendToPackage: {
    type: Boolean,
    required: false,
    default: false
  },
  canSendToWarehouse: {
    type: Boolean,
    required: false,
    default: false
  }
})
const user = useAbout();
const { t } = useI18n();
const $q = useQuasar();
const selectedData = ref({});
const toWarehouse = ref();
const showSendModal = ref(false);
const sendActionErr = ref(null);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);

const warehouse = ref([]);
const loading = ref(false);
const searchTitle = ref();
const rows = ref([{ size: '', quantity: '', max: '' }]);

function getWarehouse () {
  if (loading.value) return; // Prevent multiple rapid calls

  loading.value = true;

  let filterProps = {};

  filterProps.name = props.name;

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
      loading.value = false;
    })
}
function refresh() {
  getWarehouse();
}
function clearAction() {
  selectedData.value = {};
  toWarehouse.value = null;
  sendActionErr.value = null;
  rows.value = [{ size: '', quantity: '', max: '' }];
}
function hasEmbroidery(data) {
  return data.some(size => size.embroidery.length > 0);
}
function prefill() {
  let sizes = [];
  selectedData.value.productSize.forEach((size) => {
    sizes.push({ size: size.size, quantity: '', max: size.quantity });
  });
  rows.value = sizes;
}
function sendAction() {
  if (loading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value['@id'] || !props.fromWarehouse) {
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
    fromWarehouse: props.fromWarehouse,
    toWarehouse: toWarehouse.value,
    sentBy: user.about['@id'],
  };

  if (input.toWarehouse) {
    useProductWarehouse().send(input)
      .then(() => {
        showSendModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.ripeMaterialPurchase.confirmation.successSent')
        })
        clearAction();
      })
      .catch((res) => {
        sendActionErr.value = res.response.data['hydra:description'];

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
  } else {
    console.error('toWarehouse params not found');
  }
}
function updateAction() {
  if (!selectedData.value.id) {
    console.warn('data not found');
    return
  }

  loading.value = true;

  let productSize = [];

  rows.value.forEach((product) => {
    productSize.push({ size: product.size, quantity: product.quantity })
  })

  let input = {
    productSize: productSize,
  };

  useProductInWarehouse().update(selectedData.value.id, input)
    .then(() => {
      showUpdateModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.warehouse.confirmation.successUpdated')
      })
      clearAction();
    })
    .catch((res) => {
      updateActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.warehouse.confirmation.failure')
      })
    })
    .finally(() => {
      loading.value = false;
      refresh();
    })
}

const filteredProducts = computed(() => {
  if (!searchTitle.value) {
    return warehouse.value.productInWarehouses || [];
  }

  return (warehouse.value.productInWarehouses || []).filter(item =>
    item.productModel.name.toLowerCase().includes(searchTitle.value.toLowerCase())
  );
});

onMounted(() => {
  refresh()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center q-mb-md">
      <div class="text-h4">
        {{ $t('tables.model.header.title') }}
      </div>
      <refresh-button :action="refresh" />
    </div>
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
        <q-item-section v-if="props.showAction">
          <div class="flex justify-end">
            <q-btn
              color="primary"
              icon="mdi-dots-vertical"
              size="sm"
              round
              @click="selectedData = {...item}; prefill();"
            >
              <q-menu>
                <q-item
                  v-if="props.canUpdate"
                  v-close-popup
                  clickable
                  @click="showUpdateModal = true;"
                  class="text-warning text-no-wrap text-bold"
                >
                  <q-item-section>
                    {{ $t('edit') }}
                  </q-item-section>
                </q-item>
                <q-list separator>
                  <q-item
                    v-if="props.canSendToDefect"
                    v-close-popup
                    clickable
                    @click="showSendModal = true; toWarehouse = WAREHOUSES.cutterWarehouseDefective"
                    class="text-red text-no-wrap text-bold"
                  >
                    <q-item-section>
                      {{ $t('sendToCutterDefective') }}
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="props.canSendToEmbroidery && hasEmbroidery(selectedData?.productModel?.sizes)"
                    v-close-popup
                    clickable
                    @click="showSendModal = true; toWarehouse = WAREHOUSES.embroideryWarehouse"
                    class="text-primary text-no-wrap text-bold"
                  >
                    <q-item-section>
                      {{ $t('sendToEmbroidery') }}
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="(props.canSendToSew && !props.canSendToEmbroidery) || (props.canSendToSew && !hasEmbroidery(selectedData?.productModel?.sizes))"
                    v-close-popup
                    clickable
                    @click="showSendModal = true; toWarehouse = WAREHOUSES.sewerWarehouse"
                    class="text-primary text-no-wrap text-bold"
                  >
                    <q-item-section>
                      {{ $t('sendToSewerWarehouse') }}
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="props.canSendToPackage"
                    v-close-popup
                    clickable
                    @click="showSendModal = true; toWarehouse = WAREHOUSES.packagerWarehouse"
                    class="text-primary text-no-wrap text-bold"
                  >
                    <q-item-section>
                      {{ $t('sendToPackageWarehouse') }}
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="props.canSendToWarehouse"
                    v-close-popup
                    clickable
                    @click="showSendModal = true; toWarehouse = WAREHOUSES.productsWarehouse"
                    class="text-primary text-no-wrap text-bold"
                  >
                    <q-item-section>
                      {{ $t('sendToProductsWarehouse') }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- Dialogs -->
  <q-dialog v-model="showSendModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="sendAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="sendActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('send') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="sendActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ sendActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            disable
            v-model="selectedData.productModel.name"
            filled
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
            :rules="[ val => val !== undefined && val >= 0 && val <= Number(row.max) || $t('forms.completedMaterialOrderReport.fields.consumedDtos.quantity.validation.required')]"
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
  <q-dialog v-model="showUpdateModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="updateAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.warehouse.barUpdate') }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="updateActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ updateActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            disable
            v-model="selectedData.productModel.name"
            filled
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
            class="col-12 col-md-6"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model.number="row.quantity"
            :label="$t('forms.warehouse.fields.quantity.label')"
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.warehouse.fields.quantity.validation.required')]"
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
            :label="$t('forms.warehouse.buttons.update')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>
