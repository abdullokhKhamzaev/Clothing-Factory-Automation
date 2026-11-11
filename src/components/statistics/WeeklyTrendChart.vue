<script setup>
// Haftalik trend: sotilgan va qadoqlangan donalar (summary endpointdan).
// Yengil SVG — kutubxonasiz. PIKSEL-ANIQ render: balandlik qat'iy, kenglik
// konteynerdan o'lchanadi (ResizeObserver) — matn va chiziqlar har qanday
// ekranda keskin, cho'zilib dag'allashmaydi.
// Ranglar dataviz validatoridan o'tgan: light #2e7d32/#1976d2, dark #43a047/#2196f3.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { formatFloatToInteger } from "src/libraries/constants/defaults.js";

const props = defineProps({
  trend: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n();

const H = 230;
const PAD = { left: 52, right: 18, top: 16, bottom: 28 };

// Kenglikni konteynerdan o'lchaymiz
const wrap = ref(null);
const width = ref(720);
let resizeObserver = null;

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect?.width;
    if (w) width.value = w;
  });
  if (wrap.value) resizeObserver.observe(wrap.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());

const points = computed(() => props.trend || []);
const hasData = computed(() => points.value.length >= 2);

const maxValue = computed(() => {
  let max = 0;
  points.value.forEach(p => { max = Math.max(max, p.sold || 0, p.produced || 0); });
  return max || 1;
});

// Y o'qi uchun "chiroyli" yuqori chegara
const yTop = computed(() => {
  const raw = maxValue.value;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (raw <= m * mag) return m * mag;
  }
  return raw;
});

const yTicks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => f * yTop.value));

function x(i) {
  const n = points.value.length;
  if (n === 1) return PAD.left;
  return PAD.left + (i * (width.value - PAD.left - PAD.right)) / (n - 1);
}

function y(v) {
  return PAD.top + (1 - v / yTop.value) * (H - PAD.top - PAD.bottom);
}

function linePath(key) {
  return points.value.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key] || 0).toFixed(1)}`).join(' ');
}

// Chiziq ostidagi yumshoq maydon (bazagacha yopiq kontur)
function areaPath(key) {
  const base = y(0).toFixed(1);
  const n = points.value.length;
  return `${linePath(key)} L${x(n - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`;
}

const soldPath = computed(() => linePath('sold'));
const producedPath = computed(() => linePath('produced'));
const soldArea = computed(() => areaPath('sold'));
const producedArea = computed(() => areaPath('produced'));

// Nuqta belgilarini faqat siyrak grafikda ko'rsatamiz (zichda shovqin bo'ladi)
const showDots = computed(() => points.value.length <= 16);

// X yorliqlari: kenglikka qarab nechtasi sig'sa
const xLabelStep = computed(() => {
  const fit = Math.max(2, Math.floor((width.value - PAD.left - PAD.right) / 72));
  return Math.max(1, Math.ceil(points.value.length / fit));
});

function weekLabel(week) {
  return `${week.slice(8, 10)}.${week.slice(5, 7)}`;
}

// Hover: eng yaqin hafta + tooltip
const hoverIndex = ref(null);

function onMove(event) {
  if (!hasData.value) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const n = points.value.length;
  const step = (width.value - PAD.left - PAD.right) / (n - 1);
  const index = Math.round((px - PAD.left) / step);
  hoverIndex.value = Math.min(n - 1, Math.max(0, index));
}

const hovered = computed(() => (hoverIndex.value === null ? null : points.value[hoverIndex.value]));

// Tooltip chetga chiqib ketmasin
const tooltipStyle = computed(() => {
  if (hoverIndex.value === null) return {};
  const px = x(hoverIndex.value);
  if (px > width.value - 150) return { right: `${width.value - px + 10}px` };
  return { left: `${px + 10}px` };
});

const showTable = ref(false);
</script>

<template>
  <div v-if="hasData" class="trend-chart q-mt-md">
    <div class="flex items-center q-gutter-md q-mb-xs">
      <div class="text-subtitle2 text-grey-7">{{ t('statistics.trend.title') }}</div>
      <div class="text-caption flex items-center"><span class="dot dot-sold q-mr-xs" />{{ t('statistics.trend.sold') }}</div>
      <div class="text-caption flex items-center"><span class="dot dot-produced q-mr-xs" />{{ t('statistics.trend.produced') }}</div>
      <q-space />
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        color="grey-7"
        :icon="showTable ? 'show_chart' : 'table_rows'"
        :label="showTable ? t('statistics.trend.chartView') : t('statistics.trend.tableView')"
        @click="showTable = !showTable"
      />
    </div>

    <!-- Jadval ko'rinishi (grafikka muqobil) -->
    <q-markup-table v-if="showTable" dense flat bordered class="q-mb-sm">
      <thead>
        <tr>
          <th class="text-left">{{ t('statistics.trend.week') }}</th>
          <th class="text-right">{{ t('statistics.trend.sold') }}</th>
          <th class="text-right">{{ t('statistics.trend.produced') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in points" :key="p.week">
          <td>{{ weekLabel(p.week) }}</td>
          <td class="text-right">{{ formatFloatToInteger(p.sold) }}</td>
          <td class="text-right">{{ formatFloatToInteger(p.produced) }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <div v-else ref="wrap" class="relative-position">
      <svg
        :width="width"
        :height="H"
        class="trend-svg"
        @mousemove="onMove"
        @mouseleave="hoverIndex = null"
      >
        <!-- Gorizontal to'r + Y yorliqlari -->
        <g v-for="tick in yTicks" :key="tick">
          <line :x1="PAD.left" :x2="width - PAD.right" :y1="y(tick)" :y2="y(tick)" class="grid" />
          <text :x="PAD.left - 8" :y="y(tick) + 3.5" text-anchor="end" class="axis-label">
            {{ formatFloatToInteger(tick) }}
          </text>
        </g>

        <!-- X yorliqlari -->
        <template v-for="(p, i) in points" :key="p.week">
          <text
            v-if="i % xLabelStep === 0 || i === points.length - 1"
            :x="x(i)"
            :y="H - 9"
            text-anchor="middle"
            class="axis-label"
          >{{ weekLabel(p.week) }}</text>
        </template>

        <!-- Yumshoq maydonlar -->
        <path :d="producedArea" class="area area-produced" />
        <path :d="soldArea" class="area area-sold" />

        <!-- Hover yo'lak chizig'i -->
        <line
          v-if="hoverIndex !== null"
          :x1="x(hoverIndex)"
          :x2="x(hoverIndex)"
          :y1="PAD.top"
          :y2="H - PAD.bottom"
          class="crosshair"
        />

        <!-- Chiziqlar -->
        <path :d="producedPath" class="line line-produced" />
        <path :d="soldPath" class="line line-sold" />

        <!-- Nuqtalar (siyrak grafikda) -->
        <template v-if="showDots">
          <circle v-for="(p, i) in points" :key="'s' + p.week" :cx="x(i)" :cy="y(p.sold || 0)" r="3" class="pt pt-sold" />
          <circle v-for="(p, i) in points" :key="'p' + p.week" :cx="x(i)" :cy="y(p.produced || 0)" r="3" class="pt pt-produced" />
        </template>

        <!-- Hover nuqtalari -->
        <template v-if="hoverIndex !== null">
          <circle :cx="x(hoverIndex)" :cy="y(points[hoverIndex].sold || 0)" r="4.5" class="pt-hover pt-sold" />
          <circle :cx="x(hoverIndex)" :cy="y(points[hoverIndex].produced || 0)" r="4.5" class="pt-hover pt-produced" />
        </template>
      </svg>

      <!-- Tooltip -->
      <div v-if="hovered" class="trend-tooltip shadow-3" :style="tooltipStyle">
        <div class="text-caption text-weight-bold q-mb-xs">{{ weekLabel(hovered.week) }} {{ t('statistics.trend.weekShort') }}</div>
        <div class="text-caption flex items-center no-wrap"><span class="dot dot-sold q-mr-xs" />{{ t('statistics.trend.sold') }}:&nbsp;<b>{{ formatFloatToInteger(hovered.sold) }}</b></div>
        <div class="text-caption flex items-center no-wrap"><span class="dot dot-produced q-mr-xs" />{{ t('statistics.trend.produced') }}:&nbsp;<b>{{ formatFloatToInteger(hovered.produced) }}</b></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trend-chart {
  --trend-sold: #2e7d32;
  --trend-produced: #1976d2;
  --trend-grid: rgba(0, 0, 0, 0.07);
  --trend-text: #888;
  --trend-surface: #fff;
}
:global(body.body--dark) .trend-chart {
  --trend-sold: #43a047;
  --trend-produced: #2196f3;
  --trend-grid: rgba(255, 255, 255, 0.1);
  --trend-text: #999;
  --trend-surface: #2a2a2a;
}
.trend-svg {
  display: block;
  cursor: crosshair;
}
.grid {
  stroke: var(--trend-grid);
  stroke-width: 1;
  shape-rendering: crispEdges;
}
.axis-label {
  font-size: 11px;
  fill: var(--trend-text);
}
.area {
  stroke: none;
  opacity: 0.08;
}
.area-sold { fill: var(--trend-sold); }
.area-produced { fill: var(--trend-produced); }
.line {
  fill: none;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.line-sold { stroke: var(--trend-sold); }
.line-produced { stroke: var(--trend-produced); }
.crosshair {
  stroke: var(--trend-text);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}
.pt,
.pt-hover {
  stroke: var(--trend-surface);
  stroke-width: 1.5;
}
.pt-sold { fill: var(--trend-sold); }
.pt-produced { fill: var(--trend-produced); }
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-sold { background: var(--trend-sold); }
.dot-produced { background: var(--trend-produced); }
.trend-tooltip {
  position: absolute;
  top: 8px;
  background: var(--trend-surface);
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
}
</style>
