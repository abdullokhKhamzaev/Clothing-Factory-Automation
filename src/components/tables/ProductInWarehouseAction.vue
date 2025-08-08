<script setup>
import { onMounted, ref } from "vue";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { formatDate, isToday } from "src/libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const props = defineProps({
  acceptType: {
    type: String,
    required: false,
  },
  filters: {
    type: Object,
    required: false,
    default: Object
  },
  canAccept: {
    type: Boolean,
    default: false
  },
  canReject: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true,
  }
})

const { t } = useI18n();
const $q = useQuasar();
const user = useAbout();
const selectedData = ref({});
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
const warehouseActions = ref([]);
const warehouseActionPagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const loading = ref(false);
const columns = [
  { name: 'id', label: t('tables.warehouseAction.columns.id'), align: 'left', field: 'id' },
  { name: 'createdAt', label: t('tables.warehouseAction.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'sentBy', label: t('tables.warehouseAction.columns.sentBy'), align: 'left', field: 'sentBy' },
  { name: 'productModel', label: t('tables.warehouseAction.columns.productModel'), align: 'left', field: 'productModel' },
  { name: 'productSize', label: t('tables.warehouseAction.columns.productSize'), align: 'left', field: 'productSize' },
  { name: 'fromWarehouse', label: t('tables.warehouseAction.columns.fromWarehouse'), align: 'left', field: 'fromWarehouse' },
  { name: 'toWarehouse', label: t('tables.warehouseAction.columns.toWarehouse'), align: 'left', field: 'toWarehouse' },
  { name: 'receivedToEmbroideryBy', label: t('checkedBy'), align: 'left', field: 'receivedToEmbroideryBy' },
  { name: 'status', label: t('tables.warehouseAction.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));

function acceptAction () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  if (!user.about['@id'] || !selectedData.value['@id']) {
    console.warn('data not found');
    return
  }

  let input = {status: 'accepted'}

  switch (props.acceptType) {
    case 'embroidery':
      input.receivedToPackageBy = user.about['@id']
      break;
    case 'sew':
      input.receivedToSewingBy = user.about['@id']
      break;
    case 'package':
      input.receivedToPackageBy = user.about['@id']
      break;
    case 'warehouse':
      input.receivedToWarehouseBy = user.about['@id']
      break;
  }

  useProductWarehouse().accept(selectedData.value.id, input)
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
      loading.value = false;
      refresh();
    })
}
function rejectAction () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  useProductWarehouse().reject(selectedData.value.id, {status: 'rejected'})
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
      loading.value = false;
      refresh();
    })
}
function getWarehouseAction () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  useProductWarehouse().list({...warehouseActionPagination.value, ...props.filters})
    .then((res) => {
      warehouseActions.value = res.data['hydra:member'];
      warehouseActionPagination.value.rowsNumber = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}
function onWarehouseActionRequest(params) {
  warehouseActionPagination.value = {...warehouseActionPagination.value, ...params.pagination};
  getWarehouseAction();
}
function clearAction() {
  selectedData.value = {};
}
function refresh() {
  getWarehouseAction();
}
onMounted(() => {
  refresh()
})
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.transaction.header.empty')"
    :columns="columns"
    :visible-columns="visibleColumns"
    :rows="warehouseActions"
    row-key="id"
    v-model:pagination.sync="warehouseActionPagination"
    :rows-per-page-options="[10, 25, 50, 100, '~']"
    :loading="loading"
    @request="onWarehouseActionRequest"
  >
    <template v-slot:top>
      <div class="col-12 q-gutter-y-sm" :class="$q.screen.lt.sm ? '' : 'flex'">
        <div class="q-table__title">{{ props.title }}</div>

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
        <q-td v-for="col in columns" :key="col.name" :props="props" :class="isToday(props.row.createdAt) && 'bg-green'">
          <div v-if="col.name === 'sentBy'">
            {{ props.row.sentBy.fullName }}
          </div>
          <div v-else-if="col.name === 'createdAt'">
            {{ formatDate(props.row.createdAt) }}
          </div>
          <div v-else-if="col.name === 'productModel'">
            {{ props.row.productModel.name }}
          </div>
          <div v-else-if="col.name === 'productSize'">
            <div
              v-for="consume in props.row.productSize"
              :key="consume"
            >
              {{ consume.size }} : {{ consume.quantity }}
            </div>
          </div>
          <div v-else-if="col.name === 'fromWarehouse'">
            {{ $t('warehouses.' + props.row.fromWarehouse.name) }}
          </div>
          <div v-else-if="col.name === 'toWarehouse'">
            {{ $t('warehouses.' + props.row.toWarehouse.name) }}
          </div>
          <div v-else-if="col.name === 'receivedToEmbroideryBy'">
            {{ props.row?.receivedBy?.fullName }}
          </div>
          <div v-else-if="col.name === 'status'">
            <div v-if="props.row.status === 'pending'" class="text-red">
              {{ $t('statuses.' + props.row.status) }}
            </div>
            <div v-else-if="props.row.status === 'accepted'" class="text-green">
              {{ $t('statuses.' + props.row.status) }}
            </div>
            <div v-else class="text-red">
              {{ $t('statuses.' + props.row.status) }}
            </div>
          </div>
          <div v-else-if="col.name === 'action' && props.row.status === 'pending'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                v-if="canAccept"
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
                v-if="canReject"
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
          <div v-else>
            {{ props.row[col.field] }}
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
          :disable="loading"
          :loading="loading"
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
          :disable="loading"
          :loading="loading"
          no-caps
          :label="$t('dialogs.reject.buttons.reject')"
          color="red"
          @click="rejectAction()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
