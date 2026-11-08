<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import {useStatistics} from "stores/statistics.js";
import {formatFloatToInteger, roundToDecimal} from "src/libraries/constants/defaults.js";

const props = defineProps({
  dateFrom: {
    type: String,
    required: true,
  },
  dateTo: {
    type: String,
    required: true,
  }
})

const { t } = useI18n();

// Server tayyor agregatlarni qaytaradi: current (tanlangan davr),
// previous (xuddi shu uzunlikdagi oldingi davr — taqqoslash uchun)
const summary = ref(null);
const previous = ref(null);
const previousRange = ref(null);
const loading = ref(false);

async function getData (force = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await useStatistics().fetchSummary({
      dateFrom: props.dateFrom,
      dateTo: props.dateTo,
      force: force === true,
    });
    summary.value = res?.data?.current || null;
    previous.value = res?.data?.previous || null;
    previousRange.value = res?.data?.previousRange || null;
  } finally {
    loading.value = false;
  }
}

function moneyLine(byCurrency) {
  const parts = [];
  if (byCurrency?.Usd) parts.push(`${formatFloatToInteger(roundToDecimal(byCurrency.Usd))}$`);
  if (byCurrency?.Uzs) parts.push(`${formatFloatToInteger(roundToDecimal(byCurrency.Uzs))}so'm`);
  return parts.length ? parts.join(' + ') : '0';
}

function debtOf(block) {
  return {
    Usd: (block?.revenue?.Usd || 0) - (block?.paid?.Usd || 0),
    Uzs: (block?.revenue?.Uzs || 0) - (block?.paid?.Uzs || 0),
  };
}

// Oldingi davrga nisbatan o'zgarish foizi; oldingi davr 0 bo'lsa
// foiz ma'nosiz — ko'rsatmaymiz
function pctChange(current, prev) {
  const c = Number(current) || 0;
  const p = Number(prev) || 0;
  if (!p) return null;
  return Math.round(((c - p) / Math.abs(p)) * 100);
}

// Oddiy son uchun bitta trend, pul uchun valyutama-valyuta trendlar
function numberTrend(current, prev, goodWhenUp) {
  const pct = pctChange(current, prev);
  return pct === null ? [] : [{ label: '', pct, goodWhenUp }];
}

function moneyTrends(current, prev, goodWhenUp) {
  const trends = [];
  for (const [key, label] of [['Usd', '$'], ['Uzs', "so'm"]]) {
    const pct = pctChange(current?.[key], prev?.[key]);
    if (pct !== null) trends.push({ label, pct, goodWhenUp });
  }
  return trends;
}

const cards = computed(() => {
  const s = summary.value;
  const p = previous.value;
  if (!s) return [];

  return [
    { label: t('statistics.dashboard.sold'), value: formatFloatToInteger(s.sold), icon: 'mdi-cart-percent', color: 'green',
      trends: numberTrend(s.sold, p?.sold, true) },
    { label: t('statistics.dashboard.produced'), value: formatFloatToInteger(s.produced), icon: 'mdi-package-down', color: 'primary',
      trends: numberTrend(s.produced, p?.produced, true) },
    { label: t('statistics.dashboard.stock'), value: formatFloatToInteger(s.stock), icon: 'mdi-warehouse', color: 'secondary',
      trends: [] },
    { label: t('statistics.dashboard.revenue'), value: moneyLine(s.revenue), icon: 'mdi-cash-plus', color: 'green',
      trends: moneyTrends(s.revenue, p?.revenue, true) },
    { label: t('statistics.dashboard.paid'), value: moneyLine(s.paid), icon: 'mdi-cash-check', color: 'green',
      trends: moneyTrends(s.paid, p?.paid, true) },
    { label: t('statistics.dashboard.debt'), value: moneyLine(debtOf(s)), icon: 'mdi-cash-clock', color: 'red',
      trends: moneyTrends(debtOf(s), p ? debtOf(p) : null, false) },
    { label: `${t('statistics.dashboard.expenses')} (${t('statistics.dashboard.expensesNote')})`, value: moneyLine(s.expenses), icon: 'mdi-wallet', color: 'orange',
      trends: moneyTrends(s.expenses, p?.expenses, false) },
  ];
});

function trendColor(trend) {
  if (trend.pct === 0) return 'grey-7';
  const improved = trend.pct > 0 ? trend.goodWhenUp : !trend.goodWhenUp;
  return improved ? 'green-8' : 'red-8';
}

function trendIcon(trend) {
  if (trend.pct === 0) return 'trending_flat';
  return trend.pct > 0 ? 'trending_up' : 'trending_down';
}

watch(props, () => {
  getData();
}, {deep: true})

onMounted(() => {
  getData()
})
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <q-card-section class="flex justify-between items-center q-py-sm">
      <div>
        <div class="text-h6 text-primary">{{ $t('menus.sideBar.statistics') }}</div>
        <div v-if="previousRange" class="text-caption text-grey-7">
          {{ $t('statistics.dashboard.comparedTo') }}: {{ previousRange.from }} — {{ previousRange.to }}
        </div>
      </div>
      <refresh-button dense :action="() => getData(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-card-section class="q-pa-sm">
      <div class="row q-col-gutter-sm">
        <div v-for="card in cards" :key="card.label" class="col-6 col-sm-4 col-md-3">
          <q-card flat bordered class="q-pa-sm full-height">
            <div class="flex items-center no-wrap">
              <q-icon :name="card.icon" :color="card.color" size="28px" class="q-mr-sm" />
              <div class="ellipsis-2-lines text-caption text-grey-7">{{ card.label }}</div>
            </div>
            <div class="text-h6 text-weight-bold q-mt-xs" :class="`text-${card.color}`">
              {{ card.value }}
            </div>
            <div v-if="card.trends.length" class="q-mt-xs">
              <span
                v-for="(trend, index) in card.trends"
                :key="index"
                class="text-caption text-weight-medium q-mr-sm"
                :class="`text-${trendColor(trend)}`"
              >
                <q-icon :name="trendIcon(trend)" size="14px" />
                {{ trend.label ? trend.label + ' ' : '' }}{{ trend.pct > 0 ? '+' : '' }}{{ trend.pct }}%
                <q-tooltip>{{ $t('statistics.dashboard.vsPrevious') }}</q-tooltip>
              </span>
            </div>
          </q-card>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
