<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { formatDate } from "src/libraries/constants/defaults.js";
import { useProductModelOrderCompleted } from "stores/productModelOrderCompleted.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";

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

const { t } = useI18n();
const $q = useQuasar();
const orderLoading = ref(false);
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
const selectedData = ref({});
const columns = [
  { name: 'id', label: t('tables.completedProductModelOrder.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.completedProductModelOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'createdBy', label: t('tables.completedProductModelOrder.columns.createdBy'), align: 'left', field: 'createdBy' },
  { name: 'productModel', label: t('tables.completedProductModelOrder.columns.productModel'), align: 'left', field: 'productModel' },
  { name: 'productSize', label: t('tables.completedProductModelOrder.columns.productSize'), align: 'left', field: 'productSize' },
  { name: 'productModelOrder', label: t('tables.completedProductModelOrder.columns.expectedOutlayRipeMaterial'), align: 'left', field: 'productModelOrder' },
  { name: 'outlayRipeMaterial', label: t('tables.completedProductModelOrder.columns.outlayRipeMaterial'), align: 'left', field: 'outlayRipeMaterial' },
  { name: 'status', label: t('tables.completedProductModelOrder.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
function getOrders () {
  emit('submit');
}
function clearAction () {
  selectedData.value = {};
}
function acceptAction () {
  orderLoading.value = true;
  useProductModelOrderCompleted().accept(selectedData.value.id, { status: 'accepted' })
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
      getOrders()
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false)
}
function rejectAction () {
  orderLoading.value = true;
  useProductModelOrderCompleted().reject(selectedData.value.id, { status: 'rejected' })
    .then(() => {
      showRejectModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successRejected')
      })
      clearAction();
      emit('submit');
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => orderLoading.value = false)
}
</script>

<template>
  <skeleton-table
    :loading="loading || orderLoading"
  />
  <q-table
    v-show="!props.loading && !orderLoading"
    flat
    bordered
    :rows="props.orders"
    :columns="columns"
    :no-data-label="$t('tables.completedProductModelOrder.header.empty')"
    color="primary"
    row-key="id"
    :pagination="props.pagination"
    hide-bottom
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div class="flex justify-end" v-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                dense
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-check"
                @click="selectedData = {...props.row}; showAcceptModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('accept') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                dense
                no-caps
                no-wrap
                size="md"
                color="red"
                icon-right="mdi-cancel"
                @click="selectedData = {...props.row}; showRejectModal = true;"
              >
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('reject') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div v-else-if="col.name === 'createdBy'">
            {{ props.row?.createdBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'productModel'">
            {{ props.row?.productModel?.name || '-' }}
          </div>
          <div v-else-if="col.name === 'productSize'">
            <div
              v-for="consume in props.row.productSize"
              :key="consume"
            >
              {{ consume.size }} : {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'productModelOrder' && props.row.productModelOrder">
            <div
              v-for="consume in props.row.productModelOrder.expectedOutlayRipeMaterial"
              :key="consume"
            >
              <div>
                {{ consume.cutterRipeMaterialWarehouse.ripeMaterial.name }} {{ Number(consume.quantity) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
              </div>
              <div v-if="Number(consume.quantitySort2)">
                {{$t('forms.modelOrder.fields.expectedConsumeQuantitySort2.label')}}: {{ Number(consume.quantitySort2) }}
              </div>
              <div v-if="Number(consume.remainingSort1)">
                {{$t('forms.modelOrder.fields.expectedConsumeRemainingSort1.label')}}: {{ Number(consume.remainingSort1) }}
              </div>
              <div v-if="Number(consume.remainingSort2)">
                {{$t('forms.modelOrder.fields.expectedConsumeRemainingSort2.label')}}: {{ Number(consume.remainingSort2) }}
              </div>
            </div>
          </div>
          <div v-else-if="col.name === 'outlayRipeMaterial'">
            <div
              v-for="consume in props.row.outlayRipeMaterial"
              :key="consume"
            >
              <div>
                {{ consume.cutterRipeMaterialWarehouse.ripeMaterial.name }} {{ Number(consume.quantity) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                <div>
                  {{$t('forms.modelOrder.fields.wasteSort1.label')}}: {{ Number(consume.wasteSort1) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                </div>
              </div>
              <div v-if="Number(consume.quantitySort2)">
                {{$t('forms.modelOrder.fields.consumedQuantitySort2.label')}}: {{ Number(consume.quantitySort2) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                <div>
                  {{$t('forms.modelOrder.fields.wasteSort2.label')}}: {{ Number(consume.wasteSort2) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                </div>
              </div>
              <div v-if="Number(consume.remainingSort1)">
                {{$t('forms.modelOrder.fields.remainingSort1.label')}}: {{ Number(consume.remainingSort1) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                <div>
                  {{$t('forms.modelOrder.fields.wasteRemainingSort1.label')}}: {{ Number(consume.wasteRemainingSort1) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                </div>
              </div>
              <div v-if="Number(consume.remainingSort2)">
                {{$t('forms.modelOrder.fields.remainingSort2.label')}}: {{ Number(consume.remainingSort2) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                <div>
                  {{$t('forms.modelOrder.fields.wasteRemainingSort2.label')}}: {{ Number(consume.wasteRemainingSort1) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
                </div>
              </div>
              <div v-if="Number(consume.newRemainingSort1)">
                {{$t('forms.modelOrder.fields.newRemainingSort1.label')}}: {{ Number(consume.newRemainingSort1) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
              </div>
              <div v-if="Number(consume.newRemainingSort2)">
                {{$t('forms.modelOrder.fields.newRemainingSort2.label')}}: {{ Number(consume.newRemainingSort2) }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
              </div>
              <div>
                Total: {{
                  Number(consume.quantity) +
                  Number(consume.wasteSort1) +
                  Number(consume.quantitySort2) +
                  Number(consume.wasteSort2) +
                  Number(consume.remainingSort1) +
                  Number(consume.wasteRemainingSort1) +
                  Number(consume.remainingSort2) +
                  Number(consume.wasteRemainingSort2) +
                  Number(consume.newRemainingSort1) +
                  Number(consume.newRemainingSort2)
                }} {{consume.cutterRipeMaterialWarehouse.ripeMaterial.measurement }}
              </div>
            </div>
          </div>
          <div v-else-if="col.name === 'status'">
            {{ $t('statuses.' + props.row.status) }}
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showAcceptModal" persistent>
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.accept.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.accept.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup @click="clearAction()" />
        <q-btn
          :disable="props.loading || orderLoading"
          :loading="props.loading || orderLoading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction();"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRejectModal" persistent>
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.reject.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.reject.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.reject.buttons.cancel')" color="grey" v-close-popup @click="clearAction()" />
        <q-btn
          :disable="props.loading || orderLoading"
          :loading="props.loading || orderLoading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="rejectAction()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
