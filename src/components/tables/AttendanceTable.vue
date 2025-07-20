<script setup>
import {onMounted, ref} from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useAttendance } from "stores/attendance.js";
import { useAbout } from "stores/user/about.js";
import { formatDate, formatFloatToInteger } from "../../libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const user = useAbout();

// Dialogs
const date = ref(new Date().toISOString().split('T')[0])
const selectedData = ref({});
const showAcceptModal = ref(false);
const showDepartureModal = ref(false);
const departureActionErr = ref(false);
const attendanceLoading = ref(false);

// table settings
const columns = [
  { name: 'date', label: t('tables.attendance.columns.date'), align: 'left', field: 'date' },
  { name: 'worker', label: t('tables.attendance.columns.worker'), align: 'left', field: 'worker' },
  { name: 'isWork', label: t('tables.attendance.columns.isWork'), align: 'left', field: 'isWork' },
  { name: 'cutMoney', label: t('tables.attendance.columns.cutMoney'), align: 'left', field: 'cutMoney' },
  { name: 'isTimelyDeparture', label: t('tables.attendance.columns.isTimelyDeparture'), align: 'left', field: 'isTimelyDeparture' },
  { name: 'action', label: '', align: 'right', field: 'action', required: true }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useAttendance();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  date: date.value
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchAttendances({...pagination.value, ...filters.value})
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
  departureActionErr.value = false;
}
function acceptAction () {
  if (attendanceLoading.value) return; // Prevent multiple rapid calls

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

  repository.accept(selectedData.value.id, input)
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
      attendanceLoading.value = false;
      refresh();
    })
}
function departureAction () {
  if (attendanceLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id && !user.about['@id']) {
    console.warn('empty data');
    return;
  }

  attendanceLoading.value = true;

  const input = {
    isWork: false,
    checkedBy: user.about['@id'],
    departureAt: new Date(),
    cutMoney: selectedData.value.cutMoney,
    isTimelyDeparture: true
  }

  repository.accept(selectedData.value.id, input)
    .then(() => {
      showDepartureModal.value = false;

      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.successAccepted')
      })
      clearAction();
    })
    .catch((res) => {
      departureActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: t('forms.completedMaterialOrderReport.confirmation.failure')
      })
    })
    .finally(() => {
      attendanceLoading.value = false;
      refresh();
    })
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.attendance.header.empty')"
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
        <div class="q-table__title">{{ $t('tables.attendance.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-input
            filled
            v-model="filters.date"
            dense
            outlined
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
            mask="####-##-##"
            :debounce="1000"
            @update:model-value="getItems"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="filters.date"
                    mask="YYYY-MM-DD"
                    @update:model-value="getItems"
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
          <div v-else-if="col.name === 'isWork'">
            <q-icon
              v-if="props.row.isWork"
              name="mdi-plus" size="md" color="green"
            />
            <q-icon
              v-if="!props.row.isWork"
              name="mdi-minus" size="md" color="red"
            />
          </div>
          <div v-else-if="col.name === 'cutMoney'">
            {{ formatFloatToInteger(props.row.cutMoney) }} {{ props.row.worker.budget.name }}
          </div>
          <div v-else-if="col.name === 'isTimelyDeparture'">
            <q-icon
              v-if="props.row.isTimelyDeparture"
              name="mdi-plus" size="md" color="red"
            />
            <q-icon
              v-if="!props.row.isTimelyDeparture"
              name="mdi-minus" size="md" color="green"
            />
          </div>
          <div v-else-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                v-if="!props.row.isWork && !props.row.isTimelyDeparture"
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
                v-if="props.row.isWork && props.row.worker.salaryType === 'daily'"
                dense
                no-caps
                no-wrap
                color="orange"
                icon-right="mdi-exit-run"
                :label="$t('tables.attendance.columns.isTimelyDeparture')"
                @click="selectedData = {...props.row}; showDepartureModal = true;"
              />
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
        <div class="text-h6"> {{ $t('dialogs.attendance.bar') }}</div>
      </q-card-section>

      <q-card-section>
        {{ $t('dialogs.attendance.info') }}
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-mb-sm">
        <q-btn no-caps :label="$t('dialogs.accept.buttons.cancel')" color="grey" v-close-popup />
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
  <q-dialog v-model="showDepartureModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="departureAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="departureActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.departure.bar') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="departureActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ departureActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            type="number"
            v-model="selectedData.cutMoney"
            :label="$t('forms.departure.fields.cutMoney.label')"
            :rules="[ val => val && val > -1 || $t('forms.departure.fields.cutMoney.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || attendanceLoading"
            :loading="loading || attendanceLoading"
            no-caps
            :label="$t('dialogs.departure.buttons.confirm')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
