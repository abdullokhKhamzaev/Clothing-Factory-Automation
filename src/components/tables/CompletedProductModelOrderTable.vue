<script setup>
import {onMounted, ref} from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import {formatDate, isToday} from "src/libraries/constants/defaults.js";
import { useProductModelOrderCompleted } from "stores/productModelOrderCompleted.js";
import RefreshButton from "components/RefreshButton.vue";

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
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useProductModelOrderCompleted();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  status: 'pending'
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.getOrders({...pagination.value, ...filters.value})
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

function clearAction () {
  selectedData.value = {};
}
function acceptAction () {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  orderLoading.value = true;
  repository.accept(selectedData.value.id, { status: 'accepted' })
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh()
    })
}
function rejectAction () {
  if (orderLoading.value) return; // Prevent multiple rapid calls

  orderLoading.value = true;
  repository.reject(selectedData.value.id, { status: 'rejected' })
    .then(() => {
      showRejectModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successRejected')
      })
      clearAction();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => {
      orderLoading.value = false;
      refresh()
    })
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.completedProductModelOrder.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.completedProductModelOrder.header.title') }}</div>

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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green text-white'">
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
  <q-dialog v-model="showAcceptModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.accept.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.accept.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || orderLoading"
          :loading="loading || orderLoading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction();"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showRejectModal" persistent @hide="clearAction">
    <q-card>
      <q-card-section class="row q-pb-none">
        <div class="text-h6"> {{ $t('dialogs.reject.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.reject.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.reject.buttons.cancel')" color="grey" v-close-popup />
        <q-btn
          :disable="loading || orderLoading"
          :loading="loading || orderLoading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="rejectAction()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
