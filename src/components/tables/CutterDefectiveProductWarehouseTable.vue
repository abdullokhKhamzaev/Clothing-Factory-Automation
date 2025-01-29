
<script setup>
import { onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import SkeletonTable from "components/tables/SkeletonTable.vue";

const user = useAbout();
const { t } = useI18n();
const $q = useQuasar();
const selectedData = ref({});
const showSendModal = ref(false);
const sendActionErr = ref(false);

const warehouse = ref([]);
const loading = ref(false);

function getWarehouse (filterProps) {
  let props = filterProps || {};

  props.name = 'cutterDefectiveWarehouse';

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
    })
}
function clearAction() {
  selectedData.value = {};
  sendActionErr.value = null;
}

function sendAction() {
  if (!user.about['@id'] || !selectedData.value['@id']) {
    console.warn('data not found');
    return
  }
  loading.value = true;
  let input = {
    productModel: '',
    productSize: '',
    fromWarehouse: '',
    toWarehouse: '',
    sentBy: user.about['@id']
  };

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
      refresh();
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
    .finally(() => loading.value = false)
}

function refresh() {
  getWarehouse();
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <skeleton-table
    :loading="loading"
  />
  <q-list bordered separator>
    <q-item
      v-for="(item, index) in warehouse.productInWarehouses"
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
            icon="mdi-cogs"
            size="sm"
            round
          >
            <q-menu>
              <q-card>
                <q-item
                  v-close-popup
                  class="text-orange"
                  clickable
                >
                  <q-item-section avatar class="q-pr-md" style="min-width: auto">
                    <q-avatar
                      icon="edit"
                      color="orange"
                      class="text-white"
                      size="md"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ $t('edit') }}
                  </q-item-section>
                </q-item>
                <q-item
                  v-close-popup
                  class="text-primary"
                  clickable
                  @click="selectedData = {...item}; showSendModal = true;"
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
                    {{ $t('sendToEmbroidery') }}
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
  <q-dialog v-model="showSendModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="sendAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="sendActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.ripeMaterial.barSend') }}</div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction"/>
        </div>
        <div v-if="sendActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ sendActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <div class="col-12 q-gutter-sm">
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="sort1" label="Sort 1" />
            <q-radio v-model="selectedData.whichSort" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="sort2" label="Sort 2" />
          </div>
          <q-input
            v-if="selectedData.whichSort === 'sort1'"
            v-model="selectedData.sentQuantity"
            :prefix="`max: ${selectedData.quantity} |`"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.quantity.label')"
            lazy-rules
            :rules="[ val => val && val >= 1 && val <= Number(selectedData.quantity) || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-if="selectedData.whichSort === 'sort1'"
            v-model.number="selectedData.sentRoll"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.roll.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterialPurchase.fields.roll.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-if="selectedData.whichSort === 'sort2'"
            v-model="selectedData.sentQuantitySort2"
            :prefix="`max: ${selectedData.quantitySort2} |`"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.quantitySort2.label')"
            lazy-rules
            :rules="[ val => val && val >= 1 && val <= selectedData.quantitySort2 || $t('forms.ripeMaterialPurchase.fields.quantitySort2.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
          />
          <q-input
            v-model.number="selectedData.sentRollSort2"
            v-if="selectedData.whichSort === 'sort2'"
            type="number"
            filled
            :label="$t('forms.ripeMaterialPurchase.fields.rollSort2.label')"
            lazy-rules
            :rules="[ val => val !== undefined && val >= 0 || $t('forms.ripeMaterialPurchase.fields.rollSort2.validation.required')]"
            hide-bottom-space
            class="col-12 col-md-6"
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
    </div>
  </q-dialog>
</template>
