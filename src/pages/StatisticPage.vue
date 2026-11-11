<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { date as qdate } from "quasar";
import { DATE_FORMAT } from "src/libraries/constants/defaults.js";
import StatisticsDashboard from "components/statistics/StatisticsDashboard.vue";
import ProductionPipeline from "components/statistics/ProductionPipeline.vue";
import GrowthDynamics from "components/statistics/GrowthDynamics.vue";
import AllReports from "components/statistics/AllReports.vue";

const { t } = useI18n();

const STORAGE_KEY = 'statistic.dateRange';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fmt(d) {
  return qdate.formatDate(d, DATE_FORMAT);
}
function parse(str) {
  return qdate.extractDate(str, DATE_FORMAT);
}
// Backend Rossiyada — "bugun" avvalgidek UTC sanasi bo'yicha olinadi (toISOString bilan bir xil natija)
function utcToday() {
  const n = new Date();
  return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}
function today() {
  return fmt(utcToday());
}

// Saqlangan oraliqni o'qish (xato bo'lsa — bugun)
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && DATE_RE.test(saved.from) && DATE_RE.test(saved.to) && saved.from <= saved.to) {
      return saved;
    }
  } catch { /* ignore */ }
  return { from: today(), to: today() };
}

const initial = loadSaved();
// Bolalar komponentlariga avvalgidek 'YYYY-MM-DD' string ko'rinishida uzatiladi
const dateFrom = ref(initial.from);
const dateTo = ref(initial.to);

function setRange(from, to) {
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) return;
  if (from > to) [from, to] = [to, from];
  dateFrom.value = from;
  dateTo.value = to;
}

watch([dateFrom, dateTo], ([from, to]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ from, to }));
  } catch { /* ignore */ }
});

// q-date range rejimi: {from, to} obyekt, bir kun ikki marta bosilsa — string qaytaradi
const rangeModel = computed({
  get: () => ({ from: dateFrom.value, to: dateTo.value }),
  set: (val) => {
    if (!val) return;
    if (typeof val === 'string') {
      setRange(val, val);
    } else if (val.from && val.to) {
      setRange(val.from, val.to);
    }
  },
});

const isSingleDay = computed(() => dateFrom.value === dateTo.value);
const rangeLabel = computed(() => isSingleDay.value ? dateFrom.value : `${dateFrom.value} — ${dateTo.value}`);

// Tanlangan oraliq necha kun (kamida 1)
const rangeDays = computed(() => {
  const diff = qdate.getDateDiff(parse(dateTo.value), parse(dateFrom.value), 'days');
  return Math.max(1, diff + 1);
});

// --- Tez tanlash ---
function mondayOf(d) {
  const day = d.getDay(); // 0 = yakshanba
  const offset = day === 0 ? 6 : day - 1;
  return qdate.subtractFromDate(qdate.startOfDate(d, 'day'), { days: offset });
}

const presets = computed(() => {
  const now = utcToday();
  const yesterday = qdate.subtractFromDate(now, { days: 1 });
  const thisMonday = mondayOf(now);
  const lastMonday = qdate.subtractFromDate(thisMonday, { days: 7 });
  const lastMonthDay = qdate.subtractFromDate(qdate.startOfDate(now, 'month'), { days: 1 });

  return [
    { key: 'today', label: t('statistics.dateRange.today'), from: fmt(now), to: fmt(now) },
    { key: 'yesterday', label: t('statistics.dateRange.yesterday'), from: fmt(yesterday), to: fmt(yesterday) },
    { key: 'thisWeek', label: t('statistics.dateRange.thisWeek'), from: fmt(thisMonday), to: fmt(now) },
    { key: 'lastWeek', label: t('statistics.dateRange.lastWeek'), from: fmt(lastMonday), to: fmt(qdate.addToDate(lastMonday, { days: 6 })) },
    { key: 'thisMonth', label: t('statistics.dateRange.thisMonth'), from: fmt(qdate.startOfDate(now, 'month')), to: fmt(now) },
    { key: 'lastMonth', label: t('statistics.dateRange.lastMonth'), from: fmt(qdate.startOfDate(lastMonthDay, 'month')), to: fmt(qdate.endOfDate(lastMonthDay, 'month')) },
  ];
});

const activePreset = computed(() =>
  presets.value.find(p => p.from === dateFrom.value && p.to === dateTo.value)?.key || null
);

function applyPreset(preset) {
  setRange(preset.from, preset.to);
}

// --- Oraliqni surish ---
// OY REJIMI: oraliq oy boshidan (1-sanadan) boshlangan bo'lsa — butun oy ham,
// «Bu oy» kabi "oy boshidan bugungacha" ham — kalendar OY bo'yicha suriladi:
// 1–11 noyabrdan ◀ bossa TO'LIQ oktabr (1–31) keladi, 28/30/31 kunga o'zi
// moslashadi. ▶ bilan joriy oyga qaytilganda kelajak kunlar ko'rsatilmaydi —
// bugungacha kesiladi. Boshqa oraliqlar avvalgidek o'z uzunligiga suriladi
function shift(direction) {
  const from = parse(dateFrom.value);
  const to = parse(dateTo.value);

  if (from.getDate() === 1) {
    const monthsSpan = (to.getFullYear() * 12 + to.getMonth())
      - (from.getFullYear() * 12 + from.getMonth()) + 1;
    const newFrom = qdate.addToDate(from, { months: direction * monthsSpan });
    const newLastMonth = qdate.addToDate(newFrom, { months: monthsSpan - 1 });
    let newTo = qdate.endOfDate(newLastMonth, 'month');

    const now = utcToday();
    if (newTo > now && newFrom <= now) newTo = now;

    setRange(fmt(newFrom), fmt(newTo));
    return;
  }

  const days = rangeDays.value * direction;
  setRange(
    fmt(qdate.addToDate(from, { days })),
    fmt(qdate.addToDate(to, { days })),
  );
}

const allReports = ref(null);

function goToStep(stepNumber) {
  allReports.value?.goToStep(stepNumber);
}
</script>


<template>
  <q-card class="q-mb-md q-pa-sm">
    <div class="row items-center justify-between q-col-gutter-y-sm">
      <div class="col-12 col-md-auto">
        <div class="row q-gutter-xs">
          <q-chip
            v-for="preset in presets"
            :key="preset.key"
            clickable
            dense
            :color="activePreset === preset.key ? 'primary' : 'grey-3'"
            :text-color="activePreset === preset.key ? 'white' : 'grey-9'"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </q-chip>
        </div>
      </div>

      <div class="col-12 col-md-auto">
        <div class="row items-center no-wrap justify-end">
          <q-btn flat dense round icon="chevron_left" color="primary" @click="shift(-1)">
            <q-tooltip>{{ t('statistics.dateRange.prev') }}</q-tooltip>
          </q-btn>
          <q-btn outline icon="event" :label="rangeLabel" color="primary" no-caps>
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="rangeModel" range :mask="DATE_FORMAT">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
          <q-btn flat dense round icon="chevron_right" color="primary" @click="shift(1)">
            <q-tooltip>{{ t('statistics.dateRange.next') }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </q-card>

  <StatisticsDashboard :date-from="dateFrom" :date-to="dateTo" />

  <ProductionPipeline :date-from="dateFrom" :date-to="dateTo" @select-step="goToStep" />

  <GrowthDynamics :date-from="dateFrom" :date-to="dateTo" />

  <AllReports ref="allReports" :date-from="dateFrom" :date-to="dateTo" />
</template>
