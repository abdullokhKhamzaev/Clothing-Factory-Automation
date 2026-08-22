<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {formatDuration} from "src/libraries/constants/defaults.js";

// Statistika tablarida vaqt ko'rsatkichi:
// accepted — topshirilgandan tasdiqlangunicha o'tgan vaqt (createdAt -> receivedAt/updatedAt)
// pending  — topshirilganidan beri kutayotgan vaqt (createdAt -> hozir)
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    default: 'accepted', // 'accepted' | 'pending'
  },
});

const { t } = useI18n();

const durations = computed(() => {
  const now = Date.now();
  return props.items
    .map(item => {
      if (!item.createdAt) return null;
      const start = new Date(item.createdAt).getTime();

      if (props.mode === 'pending') {
        return now - start;
      }

      const endValue = item.receivedAt || item.updatedAt;
      if (!endValue) return null;
      return new Date(endValue).getTime() - start;
    })
    .filter(duration => duration !== null && duration >= 0);
});

const avgDuration = computed(() => {
  if (!durations.value.length) return 0;
  return durations.value.reduce((sum, d) => sum + d, 0) / durations.value.length;
});

const maxDuration = computed(() => {
  if (!durations.value.length) return 0;
  return Math.max(...durations.value);
});

const labels = computed(() => ({
  day: t('statistics.timing.day'),
  hour: t('statistics.timing.hour'),
  minute: t('statistics.timing.minute'),
  lessThanMinute: t('statistics.timing.lessThanMinute'),
}));

// Har bir yozuv bo'yicha: kim, qachon topshirgan, qachon tasdiqlangan, qancha vaqt ketgan
const detailRows = computed(() => {
  const now = Date.now();
  return props.items
    .map(item => {
      if (!item.createdAt) return null;
      const start = new Date(item.createdAt).getTime();
      const endValue = props.mode === 'pending' ? null : (item.receivedAt || item.updatedAt);
      const end = endValue ? new Date(endValue).getTime() : (props.mode === 'pending' ? now : null);
      if (end === null || end < start) return null;

      return {
        id: item.id,
        who: item.sentBy?.fullName || item.confirmedBy?.fullName || item.createdBy?.fullName || '—',
        model: item.productModel?.name || '',
        submittedAt: item.createdAt,
        confirmedAt: endValue,
        duration: end - start,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.duration - a.duration);
});

function formatDateTime(value) {
  const [datePart, timePart] = String(value).split('T');
  return `${datePart} ${timePart ? timePart.slice(0, 5) : ''}`.trim();
}
</script>

<template>
  <div v-if="durations.length">
    <q-card-section class="q-py-xs text-caption text-grey-8">
      <q-icon
        name="mdi-timer-outline"
        size="16px"
        class="q-mr-xs"
        :color="mode === 'pending' ? 'orange' : 'primary'"
      />
      <span v-if="mode === 'pending'">
        {{ t('statistics.timing.waiting') }} —
        {{ t('statistics.timing.avg') }}: <b>{{ formatDuration(avgDuration, labels) }}</b> |
        {{ t('statistics.timing.oldest') }}: <b class="text-orange">{{ formatDuration(maxDuration, labels) }}</b>
      </span>
      <span v-else>
        {{ t('statistics.timing.confirm') }} —
        {{ t('statistics.timing.avg') }}: <b>{{ formatDuration(avgDuration, labels) }}</b> |
        {{ t('statistics.timing.max') }}: <b>{{ formatDuration(maxDuration, labels) }}</b>
      </span>
    </q-card-section>

    <q-expansion-item
      dense
      :label="`${t('statistics.timing.details')} — ${detailRows.length}`"
      header-class="text-grey-8 text-caption"
      icon="mdi-format-list-bulleted"
    >
      <div style="max-height: 320px; overflow-y: auto;">
        <div v-for="row in detailRows" :key="row.id">
          <div class="row justify-between items-center wrap q-px-md q-py-xs text-caption">
            <div>
              <q-icon name="person" size="14px" class="q-mr-xs" color="primary" />
              <b>{{ row.who }}</b>
              <span v-if="row.model" class="text-grey-7"> — {{ row.model }}</span>
            </div>
            <div>
              {{ t('statistics.timing.submitted') }}: <b>{{ formatDateTime(row.submittedAt) }}</b>
              <template v-if="mode === 'pending'">
                | {{ t('statistics.timing.waitingFor') }}: <b class="text-orange">{{ formatDuration(row.duration, labels) }}</b>
              </template>
              <template v-else>
                → {{ t('statistics.timing.confirmed') }}: <b>{{ formatDateTime(row.confirmedAt) }}</b>
                | <b class="text-primary">{{ formatDuration(row.duration, labels) }}</b>
              </template>
            </div>
          </div>
          <q-separator inset />
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>
