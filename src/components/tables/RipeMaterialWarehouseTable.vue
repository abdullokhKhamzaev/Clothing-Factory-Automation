<script setup>
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useRipeMaterialAction } from "stores/ripeMaterialAction.js";
import { useAbout } from "stores/user/about.js";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import RefreshButton from "components/RefreshButton.vue";

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();

const selectedData = ref({});
const showSendModal = ref(false);
const purchaseLoading = ref(false);
const sendActionErr = ref(null);
const columns = [
  { name: 'name', label: t('tables.ripeMaterial.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.ripeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.ripeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.ripeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.ripeMaterial.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'price', label: t('tables.ripeMaterial.columns.price'), align: 'left', field: 'price' },
  { name: 'action', label: '', align: 'left', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useRipeMaterial();
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

  repository.fetchRipeMaterials({...pagination.value, ...filters.value})
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

function clearAction() {
  selectedData.value = {};
  sendActionErr.value = null;
}
function sendAction() {
  if (purchaseLoading.value) return; // Prevent multiple rapid calls

  if (!user.about['@id'] || !selectedData.value['@id']) {
    console.warn('data not found');
    return
  }
  purchaseLoading.value = true;
  let input = {
    ripeMaterial: selectedData.value['@id'],
    sentBy: user.about['@id'],
    isCutterWarehouse: true
  };

  if (selectedData.value.whichSort === 'sort1') {
    input.quantity = selectedData.value.sentQuantity;
    input.roll = selectedData.value.sentRoll;
  } else if (selectedData.value.whichSort === 'sort2') {
    input.quantitySort2 = selectedData.value.sentQuantitySort2;
    input.rollSort2 = selectedData.value.sentRollSort2;
  }

  useRipeMaterialAction().create(input)
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
      purchaseLoading.value = false;
      refresh();
    })
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.ripeMaterial.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.ripeMaterial.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
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
          <div v-if="col.name === 'name'">
            {{ props.row.name }}
          </div>

          <div v-else-if="col.name === 'quantity'">
            <span> {{ props.row.quantity }} </span>
            <span class="text-weight-bolder"> ({{ $t(props.row.measurement) }}) </span>
          </div>

          <div v-else-if="col.name === 'price'">
            <span> {{ props.row.price * props.row.quantity }} </span>
          </div>
          <div v-else-if="col.name === 'action'">
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
                    class="text-primary"
                    clickable
                    @click="selectedData = {...props.row}; showSendModal = true;"
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
                      {{ $t('tables.ripeMaterial.buttons.sendToCutter') }}
                    </q-item-section>
                  </q-item>
<!--                  <q-separator />-->
<!--                  <q-item-->
<!--                    v-close-popup-->
<!--                    class="text-negative"-->
<!--                    clickable-->
<!--                  >-->
<!--                    <q-item-section avatar>-->
<!--                      <q-avatar-->
<!--                        icon="mdi-delete-empty"-->
<!--                        color="negative"-->
<!--                        class="text-white"-->
<!--                        size="md"-->
<!--                      />-->
<!--                    </q-item-section>-->
<!--                    <q-item-section>-->
<!--                      Delete-->
<!--                    </q-item-section>-->
<!--                  </q-item>-->
                </q-card>
              </q-menu>
            </q-btn>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showSendModal" persistent @hide="clearAction">
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
          <q-btn icon="close" flat round dense v-close-popup />
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
            :rules="[ val => val && val >= 0.1 && val <= Number(selectedData.quantity) || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
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
            :disable="loading || purchaseLoading"
            :loading="loading || purchaseLoading"
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
