<script setup>
// O'sish dinamikasi: bo'limlar (to'quv, bichuv, tikuv, qadoqlash, savdo,
// tushum, xarajat) hafta/oy/yil bo'laklarida — har katakda qiymat + oldingi
// bo'lakka nisbatan ↑/↓ foiz. Direktor «oyma-oy necha foiz o'syapmiz?»
// savoliga bir qarashda javob oladi.
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStatistics } from "stores/statistics.js";
import { formatFloatToInteger, roundToDecimal } from "src/libraries/constants/defaults.js";

const props = defineProps({
  dateFrom: {
    type: String,
    required: true,
  },
  dateTo: {
    type: String,
    required: true,
  }
});

const { t } = useI18n();

const data = ref(null);
const loading = ref(false);
const unit = ref('auto');

const rangeDays = computed(() => {
  const from = new Date(props.dateFrom);
  const to = new Date(props.dateTo);
  return Math.round((to - from) / 86400000) + 1;
});

// Qaysi birliklar ma'noli: juda uzun davrda haftalik jadval cheksiz kengayib ketmasin
const unitOptions = computed(() => {
  const options = [];
  if (rangeDays.value <= 92) options.push({ value: 'week', label: t('statistics.growth.unitWeek') });
  if (rangeDays.value >= 28) options.push({ value: 'month', label: t('statistics.growth.unitMonth') });
  if (rangeDays.value >= 366) options.push({ value: 'year', label: t('statistics.growth.unitYear') });
  return options;
});

async function getData(force = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await useStatistics().fetchGrowth({
      dateFrom: props.dateFrom,
      dateTo: props.dateTo,
      unit: unit.value,
      force: force === true,
    });
    data.value = res?.data || null;
  } finally {
    loading.value = false;
  }
}

watch(() => [props.dateFrom, props.dateTo], () => {
  unit.value = 'auto'; // yangi davr — birlikni server o'zi tanlasin
  getData();
});

watch(unit, () => getData());

onMounted(getData);

// Faol birlik (serverdan qaytgan)
const activeUnit = computed(() => data.value?.unit || 'week');

function bucketLabel(bucket) {
  if (activeUnit.value === 'year') return bucket.slice(0, 4);
  if (activeUnit.value === 'month') return `${bucket.slice(5, 7)}.${bucket.slice(0, 4)}`;
  return `${bucket.slice(8, 10)}.${bucket.slice(5, 7)}`;
}

// Qiymati butunlay 0 bo'lgan qatorlarni ko'rsatmaymiz
const visibleRows = computed(() =>
  (data.value?.rows || []).filter(row => row.values.some(v => v > 0))
);

function pctOf(row, index) {
  if (index === 0) return null;
  const prev = row.values[index - 1];
  const current = row.values[index];
  if (!(prev > 0)) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function pctClass(row, index) {
  const pct = pctOf(row, index);
  if (pct === null || pct === 0) return 'text-grey-6';
  const improved = pct > 0 ? !row.inverse : row.inverse;
  return improved ? 'text-green-8' : 'text-red-8';
}

function fmtValue(value) {
  return formatFloatToInteger(roundToDecimal(value));
}
</script>

<template>
  <q-card flat bordered class="q-pa-sm q-mb-md">
    <q-card-section class="flex justify-between items-center q-py-sm">
      <div>
        <div class="text-h6 text-primary">{{ t('statistics.growth.title') }}</div>
        <div class="text-caption text-grey-7">{{ t('statistics.growth.caption') }}</div>
      </div>
      <q-btn-toggle
        v-if="unitOptions.length > 1"
        v-model="unit"
        dense
        no-caps
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-9"
        :options="unitOptions"
      />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-card-section class="q-pa-sm" style="overflow-x: auto;">
      <q-markup-table v-if="visibleRows.length" dense flat separator="cell">
        <thead>
          <tr>
            <th class="text-left">{{ t('statistics.growth.section') }}</th>
            <th v-for="bucket in data.buckets" :key="bucket" class="text-right">
              {{ bucketLabel(bucket) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visibleRows" :key="row.key">
            <td class="text-weight-medium no-wrap">
              {{ t('statistics.growth.rows.' + row.key) }}
              <span class="text-caption text-grey"> ({{ row.unit }})</span>
            </td>
            <td v-for="(value, i) in row.values" :key="i" class="text-right no-wrap">
              <div>{{ value > 0 ? fmtValue(value) : '—' }}</div>
              <div v-if="pctOf(row, i) !== null" class="text-caption" :class="pctClass(row, i)">
                {{ pctOf(row, i) > 0 ? '▲' : pctOf(row, i) < 0 ? '▼' : '' }}
                {{ pctOf(row, i) > 0 ? '+' : '' }}{{ pctOf(row, i) }}%
              </div>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
      <div v-else-if="!loading" class="text-center text-grey q-pa-md">
        {{ t('statistics.growth.empty') }}
      </div>
    </q-card-section>
  </q-card>
</template>
