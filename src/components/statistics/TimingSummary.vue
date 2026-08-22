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
</script>

<template>
  <q-card-section v-if="durations.length" class="q-py-xs text-caption text-grey-8">
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
</template>
