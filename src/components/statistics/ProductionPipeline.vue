<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";
import RefreshButton from "components/RefreshButton.vue";
import {useStatistics} from "stores/statistics.js";
import {formatFloatToInteger, formatDuration} from "src/libraries/constants/defaults.js";

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

const emit = defineEmits(['selectStep']);

const { t } = useI18n();

// Server tayyor bosqich yig'indilarini qaytaradi (Dashboard bilan
// BITTA so'rov bo'lishiladi — store promise'ni keshlaydi)
const pipeline = ref(null);
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
    pipeline.value = res?.data?.current?.pipeline || null;
  } finally {
    loading.value = false;
  }
}

// Eng eski kutilayotgan yozuv qancha vaqtdan beri turganini qaytaradi
function pendingAgeOf(stage) {
  if (!stage?.oldestPendingAt || !(stage.pending > 0)) return null;

  const elapsed = Date.now() - new Date(stage.oldestPendingAt.replace(' ', 'T')).getTime();
  if (!(elapsed > 0)) return null;

  return formatDuration(elapsed, {
    day: t('statistics.timing.day'),
    hour: t('statistics.timing.hour'),
    minute: t('statistics.timing.minute'),
    lessThanMinute: t('statistics.timing.lessThanMinute'),
  });
}

function pendingLabel(stage, unit = '') {
  if (!(stage?.pending > 0)) return null;
  return `${formatFloatToInteger(stage.pending)}${unit}`;
}

const stages = computed(() => {
  const p = pipeline.value;
  if (!p) return [];

  return [
    {
      key: 'weave',
      name: t('menus.sideBar.weaving'),
      icon: 'texture',
      done: `${formatFloatToInteger(p.weave.done)} kg`,
      pending: pendingLabel(p.weave, ' kg'),
      pendingAge: pendingAgeOf(p.weave),
      step: 1,
    },
    {
      key: 'paint',
      name: t('menus.sideBar.paint'),
      icon: 'mdi-palette',
      done: `${formatFloatToInteger(p.paint.done)} kg`,
      pending: pendingLabel(p.paint, ' kg'),
      pendingAge: pendingAgeOf(p.paint),
      step: 2,
    },
    {
      key: 'cut',
      name: t('menus.sideBar.cutting'),
      icon: 'mdi-scissors-cutting',
      done: formatFloatToInteger(p.cut.done),
      pending: pendingLabel(p.cut),
      pendingAge: pendingAgeOf(p.cut),
      step: 3,
    },
    {
      key: 'embroidery',
      name: t('menus.sideBar.embroidery'),
      icon: 'mdi-draw',
      done: formatFloatToInteger(p.embroidery.done),
      pending: pendingLabel(p.embroidery),
      pendingAge: pendingAgeOf(p.embroidery),
      step: 4,
    },
    {
      key: 'sew',
      name: t('menus.sideBar.sewing'),
      icon: 'mdi-nail',
      done: formatFloatToInteger(p.sew.done),
      pending: pendingLabel(p.sew),
      pendingAge: pendingAgeOf(p.sew),
      step: 5,
    },
    {
      key: 'package',
      name: t('menus.sideBar.package'),
      icon: 'mdi-package-down',
      done: formatFloatToInteger(p.package.done),
      pending: pendingLabel(p.package),
      pendingAge: pendingAgeOf(p.package),
      step: 6,
    },
    {
      key: 'warehouse',
      name: t('menus.sideBar.productWarehouse'),
      icon: 'mdi-warehouse',
      done: formatFloatToInteger(p.warehouse.done),
      pending: pendingLabel(p.warehouse),
      pendingAge: pendingAgeOf(p.warehouse),
      step: 6,
    },
    {
      key: 'sale',
      name: t('menus.sideBar.sales'),
      icon: 'mdi-cart-percent',
      done: formatFloatToInteger(p.sold.done),
      pending: null,
      step: 7,
    },
  ];
});

function onStageClick(stage) {
  if (stage.step) {
    emit('selectStep', stage.step);
  }
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
        <div class="text-h6 text-primary">{{ t('statistics.pipeline.title') }}</div>
        <div class="text-caption text-grey-7">{{ t('statistics.pipeline.caption') }}</div>
      </div>
      <refresh-button dense :action="() => getData(true)" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-card-section class="q-pa-sm" style="overflow-x: auto;">
      <div class="row no-wrap items-stretch">
        <template v-for="(stage, index) in stages" :key="stage.key">
          <q-card
            flat
            bordered
            class="q-pa-sm cursor-pointer column justify-between"
            :class="stage.pending ? 'pipeline-attention' : ''"
            style="min-width: 148px; flex: 1 0 148px;"
            @click="onStageClick(stage)"
          >
            <div class="flex items-center no-wrap q-mb-xs">
              <q-icon :name="stage.icon" :color="stage.pending ? 'deep-orange' : 'primary'" size="22px" class="q-mr-xs" />
              <div class="text-caption text-weight-medium ellipsis">{{ stage.name }}</div>
            </div>

            <div class="text-h6 text-weight-bold text-green">
              {{ stage.done }}
              <q-tooltip>{{ t('statistics.pipeline.confirmed') }}</q-tooltip>
            </div>

            <div v-if="stage.pending" class="q-mt-xs">
              <q-badge color="deep-orange" class="q-pa-xs">
                <q-icon name="mdi-clock-alert-outline" size="14px" class="q-mr-xs" />
                {{ stage.pending }}
                <q-tooltip>{{ t('statistics.pipeline.pending') }}</q-tooltip>
              </q-badge>
              <div v-if="stage.pendingAge" class="text-caption text-deep-orange q-mt-xs">
                {{ t('statistics.timing.oldest') }}: {{ stage.pendingAge }}
              </div>
            </div>
            <div v-else class="q-mt-xs">
              <q-icon name="mdi-check-circle-outline" color="green" size="18px">
                <q-tooltip>{{ t('statistics.pipeline.allConfirmed') }}</q-tooltip>
              </q-icon>
            </div>
          </q-card>

          <div v-if="index < stages.length - 1" class="column justify-center q-px-xs">
            <q-icon name="mdi-arrow-right-bold" color="grey-6" size="20px" />
          </div>
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.pipeline-attention {
  border-color: #ff5722;
  box-shadow: 0 0 6px rgba(255, 87, 34, 0.35);
}
</style>
