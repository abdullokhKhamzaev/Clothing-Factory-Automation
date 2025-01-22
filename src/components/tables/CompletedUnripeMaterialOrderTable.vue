<script setup>
import { onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import { useCompletedUnripeMaterialOrders } from "stores/completedUnripeMaterialOrders.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
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
const threads = ref([]);
const orderLoading = ref(false);
const threadLoading = ref(false);
const showAcceptModal = ref(false);
const showRejectModal = ref(false);
const selectedData = ref({});
const columns = [
  { name: 'unripeMaterialOrder', label: t('tables.completedUnripeMaterialOrder.columns.id'), align: 'left', field: 'unripeMaterialOrder' },
  { name: 'quantity', label: t('tables.completedUnripeMaterialOrder.columns.quantity'), align: 'left', field: 'quantity' },
  { name: 'roll', label: t('tables.completedUnripeMaterialOrder.columns.roll'), align: 'left', field: 'roll' },
  { name: 'quantitySort2', label: t('tables.completedUnripeMaterialOrder.columns.quantitySort2'), align: 'left', field: 'quantitySort2' },
  { name: 'rollSort2', label: t('tables.completedUnripeMaterialOrder.columns.rollSort2'), align: 'left', field: 'rollSort2' },
  { name: 'consumed', label: t('tables.completedUnripeMaterialOrder.columns.consumed'), align: 'left', field: 'consumed' },
  { name: 'confirmedBy', label: t('tables.completedUnripeMaterialOrder.columns.confirmedBy'), align: 'left', field: 'confirmedBy' },
  { name: 'createdAt', label: t('tables.completedUnripeMaterialOrder.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'status', label: t('tables.completedUnripeMaterialOrder.columns.status'), align: 'left', field: 'status' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
function getOrders () {
  emit('submit');
}
function clearAction() {
  selectedData.value = {};
}
function getThreads () {
  threadLoading.value = true;
  useThread().fetchThreads('')
    .then((res) => {
      threads.value = res.data['hydra:member'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}
function acceptAction () {
  orderLoading.value = true;
  useCompletedUnripeMaterialOrders().acceptOrder(selectedData.value.id, { status: 'accepted' })
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
  useCompletedUnripeMaterialOrders().rejectOrder(selectedData.value.id, { status: 'rejected' })
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

onMounted(() => {
  getThreads();
})
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
    :no-data-label="$t('tables.completedUnripeMaterialOrder.header.empty')"
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
          <div v-else-if="col.name === 'unripeMaterialOrder'">
            {{ props.row?.unripeMaterialOrder.id || '-' }}
          </div>
          <div v-else-if="col.name === 'confirmedBy'">
            {{ props.row?.confirmedBy?.fullName || '-' }}
          </div>
          <div v-else-if="col.name === 'consumed'">
            <div
              v-for="consume in props.row.consumed"
              :key="consume"
              class="q-mr-sm"
            >
              {{ consume.thread.name }}: {{ consume.quantity }} {{ consume.measurement }}
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
