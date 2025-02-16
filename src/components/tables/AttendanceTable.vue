<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useAttendance } from "stores/attendance.js";
import { useAbout } from "stores/user/about.js";
import SkeletonTable from "components/tables/SkeletonTable.vue";
import {formatDate} from "../../libraries/constants/defaults.js";

// Props
let props = defineProps({
  attendances: {
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

const $q = useQuasar();
const { t } = useI18n();
const emit = defineEmits(['submit']);

const user = useAbout();

// Dialogs
const date = ref(new Date().toISOString().split('T')[0])
const selectedData = ref({});
const showAcceptModal = ref(false);
const attendanceLoading = ref(false);

// table settings
const visibleColumns = ref([ 'date', 'worker', 'isWork', 'cutMoney', 'isTimelyDeparture' ]);
const columns = [
  { name: 'date', label: t('tables.attendance.columns.date'), align: 'left', field: 'date' },
  { name: 'worker', label: t('tables.attendance.columns.worker'), align: 'left', field: 'worker' },
  { name: 'isWork', label: t('tables.attendance.columns.isWork'), align: 'left', field: 'isWork' },
  { name: 'cutMoney', label: t('tables.attendance.columns.cutMoney'), align: 'left', field: 'cutMoney' },
  { name: 'isTimelyDeparture', label: t('tables.attendance.columns.isTimelyDeparture'), align: 'left', field: 'isTimelyDeparture' },
  { name: 'action', label: '', align: 'right', field: 'action', required: true }
];

// functions
function getAttendances() {
  emit('submit', { date: date.value });
}
function clearAction() {
  selectedData.value = {};
}
function acceptAction () {
  if (!selectedData.value.id && !user.about['@id']) {
    console.warn('empty data');
    return;
  }

  attendanceLoading.value = true;

  const input = {
    worker: selectedData.value['@id'],
    arrivalAt: new Date(),
    checkedBy: user.about['@id'],
    isWork: true
  }

  useAttendance().accept(selectedData.value.id, input)
    .then(() => {
      showAcceptModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
      getAttendances();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => attendanceLoading.value = false)
}
</script>

<template>
  <skeleton-table
    :loading="props.loading || attendanceLoading"
  />
  <q-table
    v-show="!loading && !attendanceLoading"
    flat
    bordered
    :rows="props.attendances"
    :columns="columns"
    :no-data-label="$t('tables.attendance.header.empty')"
    :loading="props.loading || attendanceLoading"
    :visible-columns="visibleColumns"
    color="primary"
    :pagination="props.pagination"
    hide-pagination
  >
    <template v-slot:top>
      <div class="col-12 flex">
        <q-input
          filled
          v-model="date"
          dense
          outlined
          :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
          mask="####-##-##"
          :debounce="1000"
          @update:model-value="emit('submit', { date: date })"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="date"
                  mask="YYYY-MM-DD"
                  @update:model-value="emit('submit', { date: date })"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
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
          :class="$q.screen.lt.sm ? 'full-width q-mb-md' : 'q-ml-auto q-mr-sm'"
        />
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td
          auto-width
          v-for="col in columns"
          :key="col.name"
          :props="props"
        >
          <div v-if="col.name === 'date'">
            {{ formatDate(props.row.date).slice(0, 11) }}
          </div>
          <div v-else-if="col.name === 'worker'">
            {{ props.row.worker.fullName }}
          </div>
          <div v-else-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                v-if="!props.row.isWork"
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
          :disable="loading || attendanceLoading"
          :loading="loading || attendanceLoading"
          no-caps
          :label="$t('dialogs.accept.buttons.accept')"
          color="green"
          @click="acceptAction();"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped>
</style>
