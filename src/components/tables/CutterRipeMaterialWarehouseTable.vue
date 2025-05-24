<script setup>
import SkeletonTable from "components/tables/SkeletonTable.vue";
import { useI18n } from "vue-i18n";
import {ref} from "vue";
import {useRipeMaterialAction} from "stores/ripeMaterialAction.js";
import {useQuasar} from "quasar";
import {useAbout} from "stores/user/about.js";

const emit = defineEmits(['submit']);
let props = defineProps({
  materials: {
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

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();

const selectedData = ref({});
const showSendModal = ref(false);
const sendActionErr = ref(null);
const materialLoading = ref(null);

const columns = [
  { name: 'ripeMaterial', label: t('tables.cutterRipeMaterial.columns.ripeMaterial'), align: 'left', field: 'ripeMaterial' },
  { name: 'quantity', label: t('tables.cutterRipeMaterial.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.cutterRipeMaterial.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.cutterRipeMaterial.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.cutterRipeMaterial.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'remainingSort1', label: t('tables.cutterRipeMaterial.columns.remainingSort1'), align: 'left', field: 'remainingSort1' },
  { name: 'remainingSort2', label: t('tables.cutterRipeMaterial.columns.remainingSort2'), align: 'left', field: 'remainingSort2' },
  { name: 'action', label: '', align: 'left', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

function clearAction() {
  selectedData.value = {};
  sendActionErr.value = null;
}

function sendAction() {
  if (!user.about['@id'] || !selectedData.value.ripeMaterial['@id']) {
    console.warn('data not found');
    return
  }
  materialLoading.value = true;
  let input = {
    ripeMaterial: selectedData.value.ripeMaterial['@id'],
    sentBy: user.about['@id'],
    isCutterWarehouse: false
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
      emit('submit');
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
    .finally(() => materialLoading.value = false)
}
</script>

<template>
  <skeleton-table
    :loading="props.loading || materialLoading"
  />
  <q-table
    v-show="!props.loading && !materialLoading"
    flat
    bordered
    :rows="props.materials"
    :columns="columns"
    :visible-columns="visibleColumns"
    :no-data-label="$t('tables.repaint.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:top>
      <div class="col-12 flex items-center justify-between">
        <div class="q-table__title">{{ $t('tables.cutterRipeMaterial.header.title') }}</div>
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
          :class="$q.screen.lt.sm ? 'full-width q-mb-md' : ''"
        />
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'ripeMaterial'">
            {{props.row.ripeMaterial.name }}
          </div>
          <div v-else-if="col.name === 'quantity'">
            {{ Number(props.row.quantity) > 0 ? `${props.row.quantity} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'roll'">
            {{ Number(props.row.roll) > 0 ? props.row.roll : '-' }}
          </div>
          <div v-else-if="col.name === 'quantitySort2'">
            {{ Number(props.row.quantitySort2) > 0 ? `${props.row.quantitySort2} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'rollSort2'">
            {{ Number(props.row.rollSort2) > 0 ? props.row.rollSort2 : '-' }}
          </div>
          <div v-else-if="col.name === 'remainingSort1'">
            {{ Number(props.row.remainingSort1) > 0 ? `${props.row.remainingSort1} ${props.row.ripeMaterial.measurement}` : '-' }}
          </div>
          <div v-else-if="col.name === 'remainingSort2'">
            {{ Number(props.row.remainingSort2) > 0 ? `${props.row.remainingSort2} ${props.row.ripeMaterial.measurement}` : '-' }}
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
                      {{ $t('tables.cutterRipeMaterial.buttons.sendToWarehouse') }}
                    </q-item-section>
                  </q-item>
                </q-card>
              </q-menu>
            </q-btn>
          </div>
          <div v-else>
            {{ props.row[col.field] }}
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
            :rules="[ val => val && val >= 1 && val <= selectedData.quantity || $t('forms.ripeMaterialPurchase.fields.quantity.validation.required')]"
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
            :disable="props.loading || materialLoading"
            :loading="props.loading || materialLoading"
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
