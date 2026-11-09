<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useSalary } from "stores/salary.js";
import { useWorkEntries } from "stores/workEntries.js";
import { buildReportData, buildReportHtml } from "src/libraries/salaryReport.js";
import { salaryPortionOf, extraTotalOf, extraReasonsOf } from "src/libraries/salaryPeriod.js";
import { formatDate, formatFloatToInteger, roundToDecimal, apiErrorMessage, savedRowsPerPage, rememberRowsPerPage } from "../../libraries/constants/defaults.js";
import SalaryPaymentsList from "components/SalaryPaymentsList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();

// Dialogs
const selectedData = ref({});
const showSalaryModal = ref(false);
const showAdvanceModal = ref(false);
const salaryActionErr = ref(false);
const advanceActionErr = ref(false);
const salaryLoading = ref(false);

// table settings
const columns = [
  { name: 'worker', label: t('tables.users.columns.worker'), align: 'left', field: 'worker', required: true },
  { name: 'month', label: t('tables.users.columns.month'), align: 'left', field: 'month' },
  { name: 'baseSalary', label: t('tables.users.columns.baseSalary'), align: 'left', field: 'baseSalary' },
  { name: 'dailyWage', label: t('tables.users.columns.dailyWage'), align: 'left', field: 'dailyWage' },
  { name: 'workedDays', label: t('tables.users.columns.workedDays'), align: 'left', field: 'workedDays' },
  { name: 'pieceworkEarning', label: t('tables.users.columns.pieceworkEarning'), align: 'left', field: 'pieceworkEarning' },
  { name: 'extraPayment', label: t('tables.users.columns.extraPayment'), align: 'left', field: 'extraPayment' },
  { name: 'advancePayment', label: t('tables.users.columns.advancePayment'), align: 'left', field: 'advancePayment' },
  { name: 'paidAmount', label: t('tables.users.columns.paidAmount'), align: 'left', field: 'paidAmount' },
  { name: 'remaining', label: t('tables.users.columns.remaining'), align: 'left', field: 'remaining' },
  { name: 'transaction', label: t('tables.users.columns.transaction'), align: 'left', field: 'transaction' },
  { name: 'action', label: '', align: 'right', field: 'action', required: true }
];
const visibleColumns = ref(columns.map(column => column.name));

// Table Data
const repository = useSalary();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: savedRowsPerPage('tables/SalariesTable'),
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  month: new Date().toISOString().split('T')[0].slice(0, 7),
  workerName: '',
});

// Tanlangan oy bo'yicha BARCHA oyliklar (sahifalanmagan) — tepadagi jami uchun
const allSalaries = ref([]);

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchSalaries({...pagination.value, ...filters.value})
    .then((res) => {
      items.value = res.data['hydra:member'];
      pagination.value.rowsNumber = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });

  repository.fetchSalaries({...filters.value, rowsPerPage: '~'})
    .then((res) => {
      allSalaries.value = res?.data['hydra:member'] || [];
    });
}

// Oy ichida TO'LOVLAR bilan berilgan qo'shimchalar yig'indisi (yo'l kira, ovqat
// puli va h.k.) — admin to'lov paytida ko'rsatadi, maosh hisobiga kirmaydi
function monthExtraOf(salary) {
  return extraTotalOf(salary.transaction);
}

// Bir yozuvning hisoblangan oyligi: baseSalary yoki dailyWage yoki ishbay.
// DIQQAT: salary.dailyWage — kunlik stavka EMAS, oyning YIG'ILGAN jami!
// Davomat belgilanganda unga ishchining kunlik stavkasi qo'shib boriladi
// (jarimalar ayirilgan) — shuning uchun workedDays ga KO'PAYTIRILMAYDI
function earnedOf(salary) {
  const baseSalary = Number(salary.baseSalary) || 0;
  const dailyWage = Number(salary.dailyWage) || 0;
  const pieceworkEarning = Number(salary.pieceworkEarning) || 0;

  if (baseSalary > 0) return baseSalary;
  if (dailyWage > 0) return dailyWage;
  return pieceworkEarning;
}

// Kunlik ishchining oy jarimasi: stavka x kunlar - yig'ilgan jami.
// (Davomatda kun qo'shilganda stavka qo'shiladi, jarima ayiriladi — farq = jarima.
// To'liq kuni kesilgan jarima bu farqda ko'rinmaydi, u kunlar sonida aks etadi)
function penaltyOf(salary) {
  const rate = Number(salary.worker?.salary) || 0;
  const days = Number(salary.workedDays) || 0;
  const total = Number(salary.dailyWage) || 0;
  if (rate <= 0 || days <= 0 || total <= 0) return 0;
  return Math.max(0, rate * days - total);
}

// Bir yozuvning MAOSH uchun to'langani — tranzaksiyalar yig'indisi (avans ham
// shu yerda), har to'lovning QO'SHIMCHA qismi (yo'l kira) chiqarib tashlanadi.
// salary.paidAmount/advancePayment maydonlari OXIRGI to'lovni yozadi xolos,
// bir oyda bir necha to'lov bo'lsa kam ko'rsatib qo'yadi — ularga ishonmaymiz
function paidOf(salary) {
  return (salary.transaction || []).reduce((sum, t) => sum + salaryPortionOf(t), 0);
}

// Qarzimiz: faqat musbat qoldiq. Ortiqcha to'langan (bonus) ishchi
// boshqa ishchining qarzini jamida "yopib" yubormasligi kerak
function debtOf(salary) {
  return Math.max(0, earnedOf(salary) - paidOf(salary));
}

function bonusOf(salary) {
  return Math.max(0, paidOf(salary) - earnedOf(salary));
}

// «Nega hisoblanmagan» sababi (to'lov bor-u, hisob 0 bo'lgan qatorlar uchun)
function unearnedReasonOf(salary) {
  const type = salary.worker?.salaryType;
  if (type === 'daily') return 'noAttendance';
  if (type === 'monthly') return 'noSalarySet';
  return 'noEntries';
}

// ---- PDF hisobot (direktor uchun: ishchilardan qancha qarzmiz) ----
const showReportDialog = ref(false);
const reportLoading = ref(false);
const reportPeriod = ref(2); // 1 = 1–15 (ishbay), 2 = oy yakuni (hammasi)

async function generateReport() {
  if (reportLoading.value) return;
  reportLoading.value = true;

  try {
    const month = filters.value.month;
    const [year, monthNum] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNum, 0).getDate();

    // Oyning barcha tasdiqlangan ish yozuvlari (ishbay hisobi uchun)
    const entriesRes = await useWorkEntries().list({
      page: 1,
      rowsPerPage: '~',
      status: 'accepted',
      dateFrom: `${month}-01T00:00:00`,
      dateTo: `${month}-${String(lastDay).padStart(2, '0')}T23:59:59`
    });
    const entries = entriesRes?.data?.['hydra:member'] || [];

    const data = buildReportData(allSalaries.value, entries, reportPeriod.value);
    const periodLabel = reportPeriod.value === 1
      ? t('salaryReport.period1Label')
      : t('salaryReport.monthEndLabel');

    const html = buildReportHtml(data, {
      title: `${t('salaryReport.title')} — ${month}`,
      subtitle: periodLabel,
      generatedLine: `${t('salaryReport.generated')}: ${new Date().toLocaleString()}`,
      formatMoney: (v) => formatFloatToInteger(roundToDecimal(v)),
      labels: {
        worker: t('tables.users.columns.worker'),
        type: t('salaryReport.type'),
        owed: t('statistics.salarySummary.earned'),
        paid: t('statistics.salarySummary.paid'),
        debt: t('tables.users.columns.remaining'),
        totalDebt: t('statistics.salarySummary.debt'),
        status: t('salaryReport.status'),
        fullyPaid: t('salaryInfo.statuses.fullyPaid'),
        bonus: t('salaryInfo.cards.bonus'),
        extraSuffix: t('tables.users.columns.extraPayment'),
        days: t('tables.users.columns.days'),
        empty: t('salaryReport.empty'),
        types: {
          piecework: t('salaryReport.types.piecework'),
          monthly: t('salaryReport.types.monthly'),
          daily: t('salaryReport.types.daily'),
        },
        reasons: {
          noAttendance: t('salaryReport.reasons.noAttendance'),
          noSalarySet: t('salaryReport.reasons.noSalarySet'),
          noEntries: t('salaryReport.reasons.noEntries'),
        },
      },
    });

    // Yashirin iframe orqali chop etamiz — popup emas, brauzer BLOKLAMAYDI.
    // Chop oynasida foydalanuvchi «PDF sifatida saqlash»ni tanlaydi
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();

    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      // Chop oynasi yopilgach iframe'ni tozalaymiz
      setTimeout(() => frame.remove(), 60000);
    }, 300);

    showReportDialog.value = false;
  } finally {
    reportLoading.value = false;
  }
}

const salaryTotals = computed(() => {
  const earned = {};
  const paid = {};
  const debt = {};
  const bonus = {};

  allSalaries.value.forEach(salary => {
    const currency = salary.budget?.name || '';
    earned[currency] = (earned[currency] || 0) + earnedOf(salary);
    paid[currency] = (paid[currency] || 0) + paidOf(salary);
    debt[currency] = (debt[currency] || 0) + debtOf(salary);
    bonus[currency] = (bonus[currency] || 0) + bonusOf(salary);
  });

  return { earned, paid, debt, bonus };
});

function moneyLine(byCurrency) {
  const parts = Object.entries(byCurrency)
    .filter(([, value]) => roundToDecimal(value) !== 0)
    .map(([currency, value]) => `${formatFloatToInteger(roundToDecimal(value))} ${currency}`);
  return parts.length ? parts.join(' + ') : '0';
}

function onRequest(params) {
  pagination.value = {...pagination.value, ...params.pagination};
  rememberRowsPerPage('tables/SalariesTable', params.pagination.rowsPerPage);
  getItems();
}
function refresh () {
  getItems();
}

onMounted(() => {
  refresh();
})

// functions
function clearAction() {
  selectedData.value = {};
  salaryActionErr.value = false;
  advanceActionErr.value = false;
}
function paySalaryAction () {
  if (salaryLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  salaryLoading.value = true;

  const input = {
    paidAmount: selectedData.value.quantity,
    isPaid: false
  }

  // To'lovning qo'shimcha qismi (yo'l kira va h.k.) — admin shu yerda ko'rsatadi
  if (Number(selectedData.value.extraQuantity) > 0) {
    input.extraAmount = String(selectedData.value.extraQuantity);
    input.extraReason = (selectedData.value.extraReason || '').trim();
  }

  repository.paySalary(selectedData.value.id, input)
    .then(() => {
      showSalaryModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.successPayed')
      })
      clearAction();
    })
    .catch((res) => {
      salaryActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: apiErrorMessage(res, t('forms.salary.confirmation.failure'))
      })
    })
    .finally(() => {
      salaryLoading.value = false;
      refresh();
    })
}
function payAdvanceAction () {
  if (salaryLoading.value) return; // Prevent multiple rapid calls

  if (!selectedData.value.id) {
    console.warn('empty data');
    return;
  }

  salaryLoading.value = true;

  const input = {
    advancePayment: selectedData.value.quantity,
  }

  if (Number(selectedData.value.extraQuantity) > 0) {
    input.extraAmount = String(selectedData.value.extraQuantity);
    input.extraReason = (selectedData.value.extraReason || '').trim();
  }

  repository.payAdvance(selectedData.value.id, input)
    .then(() => {
      showAdvanceModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: t('forms.salary.confirmation.successPayed')
      })
      clearAction();
    })
    .catch((res) => {
      advanceActionErr.value = res.response.data['hydra:description'];

      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: apiErrorMessage(res, t('forms.salary.confirmation.failure'))
      })
    })
    .finally(() => {
      salaryLoading.value = false;
      refresh();
    })
}
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-sm full-height">
          <div class="flex items-center no-wrap">
            <q-icon name="mdi-cash-multiple" color="primary" size="24px" class="q-mr-sm" />
            <div class="text-caption text-grey-7">{{ $t('statistics.salarySummary.earned') }}</div>
          </div>
          <div class="text-h6 text-weight-bold text-primary q-mt-xs">{{ moneyLine(salaryTotals.earned) }}</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-sm full-height">
          <div class="flex items-center no-wrap">
            <q-icon name="mdi-cash-check" color="green" size="24px" class="q-mr-sm" />
            <div class="text-caption text-grey-7">{{ $t('statistics.salarySummary.paid') }}</div>
          </div>
          <div class="text-h6 text-weight-bold text-green q-mt-xs">{{ moneyLine(salaryTotals.paid) }}</div>
        </q-card>
      </div>
      <!-- ASOSIY raqam: ishchilarga yana qancha berishimiz kerak.
           Har ishchi bo'yicha faqat musbat qoldiq yig'iladi — birovning
           bonusi boshqaning qarzini yashirmaydi -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-sm full-height debt-card">
          <div class="flex items-center no-wrap">
            <q-icon name="mdi-cash-clock" color="negative" size="24px" class="q-mr-sm" />
            <div class="text-caption text-grey-7">{{ $t('statistics.salarySummary.debt') }}</div>
          </div>
          <div class="text-h6 text-weight-bold text-negative q-mt-xs">{{ moneyLine(salaryTotals.debt) }}</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-sm full-height">
          <div class="flex items-center no-wrap">
            <q-icon name="mdi-star-circle" color="amber-8" size="24px" class="q-mr-sm" />
            <div class="text-caption text-grey-7">{{ $t('statistics.salarySummary.bonusPaid') }}</div>
          </div>
          <div class="text-h6 text-weight-bold text-amber-9 q-mt-xs">{{ moneyLine(salaryTotals.bonus) }}</div>
        </q-card>
      </div>
    </div>
  </q-card>

  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.users.header.empty')"
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
      <!-- Mobil: har element o'z qatorida (grid), desktop: bir qatorda o'ngga tekis -->
      <div class="full-width row items-center q-col-gutter-sm">
        <div class="col-12 col-sm-auto">
          <div class="q-table__title">{{ $t('tables.users.header.title') }}</div>
        </div>
        <q-space v-if="$q.screen.gt.xs" />
        <div class="col-12 col-sm-auto">
          <q-input
            style="min-width: 220px"
            dense
            outlined
            clearable
            v-model="filters.workerName"
            :debounce="600"
            :label="$t('tables.users.header.searchTitle')"
            @update:model-value="getItems"
            class="full-width"
          >
            <template v-slot:append>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-auto">
          <q-input
            filled
            v-model="filters.month"
            dense
            outlined
            mask="####-##"
            :debounce="1000"
            @update:model-value="getItems"
            class="full-width"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="filters.month"
                    mask="YYYY-MM"
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
        </div>
        <div class="col-8 col-sm-auto">
          <q-btn
            no-caps
            color="deep-purple"
            icon="picture_as_pdf"
            :label="$t('salaryReport.button')"
            :loading="reportLoading"
            class="full-width"
            @click="showReportDialog = true"
          />
        </div>
        <div class="col-4 col-sm-auto">
          <refresh-button :action="refresh" class="full-width" />
        </div>
        <div class="col-12 col-sm-auto">
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
            class="full-width"
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
          <div v-if="col.name === 'worker'">
            <router-link
              class="text-primary"
              :to="{
                name: 'club.user.salary',
                params: { id:props.row.worker['@id'] },
              }"
            >
              {{ props.row.worker.fullName }}
            </router-link>
          </div>
          <div v-else-if="col.name === 'month'">
            {{ formatDate(props.row.month).slice(0, 10) }}
          </div>
          <div v-else-if="col.name === 'baseSalary'">
            {{ formatFloatToInteger(props.row.baseSalary) === '0' ? '-' : formatFloatToInteger(props.row.baseSalary) + ' ' + props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'dailyWage'">
            <!-- Kunlik ishchi: stavka (kuniga) + oy jami alohida.
                 Profilda stavka bo'lmasa — o'rtacha (jami / kunlar) ko'rsatiladi -->
            <template v-if="Number(props.row.dailyWage) > 0">
              <div v-if="Number(props.row.worker?.salary) > 0">
                {{ formatFloatToInteger(props.row.worker.salary) }} {{ props.row.budget.name }} {{ $t('tables.users.columns.perDay') }} × {{ props.row.workedDays }} {{ $t('tables.users.columns.days') }}
              </div>
              <div v-else-if="Number(props.row.workedDays) > 0">
                ~{{ formatFloatToInteger(roundToDecimal(props.row.dailyWage / props.row.workedDays)) }} {{ props.row.budget.name }} {{ $t('tables.users.columns.perDay') }}
              </div>
              <div v-if="penaltyOf(props.row) > 0" class="text-caption text-negative">
                {{ $t('tables.users.columns.penalty') }}: −{{ formatFloatToInteger(penaltyOf(props.row)) }} {{ props.row.budget.name }}
              </div>
              <div class="text-caption text-grey">
                {{ $t('total') }}: {{ formatFloatToInteger(props.row.dailyWage) }} {{ props.row.budget.name }} ({{ props.row.workedDays }} {{ $t('tables.users.columns.days') }})
              </div>
            </template>
            <template v-else>-</template>
          </div>
          <div v-else-if="col.name === 'pieceworkEarning'">
            {{ formatFloatToInteger(props.row.pieceworkEarning) === '0' ? '-' : formatFloatToInteger(props.row.pieceworkEarning) + ' ' + props.row.budget.name}}
          </div>
          <div v-else-if="col.name === 'extraPayment'">
            <template v-if="monthExtraOf(props.row) > 0">
              <div>{{ formatFloatToInteger(monthExtraOf(props.row)) }} {{ props.row.budget.name }}</div>
              <div v-if="extraReasonsOf(props.row.transaction)" class="text-caption text-grey">
                {{ extraReasonsOf(props.row.transaction) }}
              </div>
            </template>
            <template v-else>-</template>
          </div>
          <div v-else-if="col.name === 'advancePayment'">
            {{ formatFloatToInteger(props.row.advancePayment) === '0' ? '-' : formatFloatToInteger(props.row.advancePayment) + ' ' + props.row.budget.name}}
          </div>
          <div v-else-if="col.name === 'paidAmount'">
            {{ formatFloatToInteger(paidOf(props.row)) }} {{ props.row.budget.name }}
          </div>
          <div v-else-if="col.name === 'remaining'">
            <q-badge v-if="debtOf(props.row) > 0" color="negative" class="q-pa-xs">
              {{ formatFloatToInteger(debtOf(props.row)) }} {{ props.row.budget.name }}
            </q-badge>
            <template v-else-if="bonusOf(props.row) > 0">
              <q-badge color="amber-8" class="q-pa-xs">
                +{{ formatFloatToInteger(bonusOf(props.row)) }} {{ $t('salaryInfo.cards.bonus') }}
              </q-badge>
              <!-- Nega hisoblanmagan — ochiq yozamiz (davomat yo'q / maosh belgilanmagan / ish yo'q) -->
              <div v-if="earnedOf(props.row) === 0" class="text-caption text-grey q-mt-xs">
                {{ $t('salaryReport.reasons.' + unearnedReasonOf(props.row)) }}
              </div>
            </template>
            <q-badge v-else-if="earnedOf(props.row) > 0" color="positive" class="q-pa-xs">
              <q-icon name="check" size="xs" class="q-mr-xs" /> {{ $t('salaryInfo.statuses.fullyPaid') }}
            </q-badge>
            <span v-else>-</span>
          </div>
          <div v-else-if="col.name === 'transaction'">
            <q-toggle
              v-if="props.row?.transaction.length"
              v-model="props.expand"
              dense
              color="primary"
              :icon="props.expand ? 'add' : 'remove'"
              :label="$t('tables.users.columns.transaction')"
            />
          </div>

          <div v-else-if="col.name === 'action'">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn
                dense
                outline
                no-caps
                no-wrap
                color="green"
                icon-right="mdi-cash"
                :label="$t('paySalary')"
                @click="selectedData = {...props.row}; showSalaryModal = true;"
              />
              <q-btn
                v-if="!Number(props.row.advancePayment)"
                dense
                outline
                no-caps
                no-wrap
                color="primary"
                icon-right="mdi-cash"
                :label="$t('payAdvance')"
                @click="selectedData = {...props.row}; showAdvanceModal = true;"
              />
            </div>
          </div>

          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <salary-payments-list :lists="props.row.transaction" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <!-- PDF hisobot: davr tanlash -->
  <q-dialog v-model="showReportDialog">
    <q-card style="min-width: 340px">
      <q-card-section class="text-h6">{{ $t('salaryReport.dialogTitle') }}</q-card-section>
      <q-card-section class="q-pt-none">
        <q-option-group
          v-model="reportPeriod"
          :options="[
            { label: $t('salaryReport.period1Label'), value: 1 },
            { label: $t('salaryReport.monthEndLabel'), value: 2 },
          ]"
          type="radio"
        />
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn no-caps flat color="grey" :label="$t('dialogs.accept.buttons.cancel')" v-close-popup />
        <q-btn
          no-caps
          color="deep-purple"
          icon="picture_as_pdf"
          :label="$t('salaryReport.generate')"
          :loading="reportLoading"
          @click="generateReport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showSalaryModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="paySalaryAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="salaryActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.salary.bar') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="salaryActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ salaryActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            :prefix="selectedData.budget.name"
            type="number"
            v-model="selectedData.quantity"
            :label="$t('forms.salary.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.salary.fields.quantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <!-- Qo'shimcha to'lov: umumiy summaning qancha qismi yo'l kira/ovqat
               kabi qo'shimcha ekanini admin shu yerda ko'rsatadi; bu qism
               davr maoshini yopishga hisoblanmaydi, alohida ko'rsatiladi -->
          <q-input
            filled
            :prefix="selectedData.budget.name"
            type="number"
            v-model="selectedData.extraQuantity"
            :label="$t('forms.salary.fields.extra.label')"
            :hint="$t('forms.salary.fields.extra.hint')"
            :rules="[ val => !Number(val) || Number(val) <= Number(selectedData.quantity || 0) || $t('forms.salary.fields.extra.validation.max')]"
            class="col-12 col-md-6"
          />
          <q-input
            filled
            v-model="selectedData.extraReason"
            :label="$t('forms.salary.fields.extraReason.label')"
            :rules="[ val => !Number(selectedData.extraQuantity) || !!(val && val.trim()) || $t('forms.salary.fields.extraReason.validation.required')]"
            class="col-12 col-md-6"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || salaryLoading"
            :loading="loading || salaryLoading"
            no-caps
            :label="$t('forms.salary.buttons.pay')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showAdvanceModal" persistent @hide="clearAction">
    <q-card style="width: 900px; max-width: 80vw;">
      <q-form @submit.prevent="payAdvanceAction">
        <div
          class="q-px-md q-py-sm flex justify-between"
          :class="advanceActionErr ? 'bg-red' : 'q-my-sm'"
        >
          <div class="text-h6"> {{ $t('dialogs.advance.bar') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="advanceActionErr">
          <q-separator />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"

            />
            {{ advanceActionErr }}
          </div>
          <q-separator />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            :prefix="selectedData.budget.name"
            filled
            v-model="selectedData.quantity"
            :label="$t('forms.advance.fields.quantity.label')"
            :rules="[ val => val && val > -1 || $t('forms.advance.fields.quantity.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            :prefix="selectedData.budget.name"
            type="number"
            v-model="selectedData.extraQuantity"
            :label="$t('forms.salary.fields.extra.label')"
            :hint="$t('forms.salary.fields.extra.hint')"
            :rules="[ val => !Number(val) || Number(val) <= Number(selectedData.quantity || 0) || $t('forms.salary.fields.extra.validation.max')]"
            class="col-12 col-md-6"
          />
          <q-input
            filled
            v-model="selectedData.extraReason"
            :label="$t('forms.salary.fields.extraReason.label')"
            :rules="[ val => !Number(selectedData.extraQuantity) || !!(val && val.trim()) || $t('forms.salary.fields.extraReason.validation.required')]"
            class="col-12 col-md-6"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || salaryLoading"
            :loading="loading || salaryLoading"
            no-caps
            :label="$t('forms.advance.buttons.pay')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<style scoped>
.debt-card {
  border-left: 4px solid #c10015;
  background: rgba(193, 0, 21, 0.04);
}
</style>
