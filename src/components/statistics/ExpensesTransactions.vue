<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useTransaction } from "stores/transaction.js";
import { useI18n } from "vue-i18n";
import { formatFloatToInteger, roundToDecimal } from "../../libraries/constants/defaults.js";
import RefreshButton from "components/RefreshButton.vue";

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
const emit = defineEmits(['retrieveData']);

const splitterModel = ref(50);
const onlyShowSalary = ref(false);
const models = ref([]);
const loading = ref(false);

async function getModels() {
  if (loading.value) return;
  loading.value = true;

  const filterProps = {
    createdAtFrom: props.dateFrom + 'T00:00:00',
    createdAtTo: props.dateTo + 'T23:59:59',
    isIncome: false,
    rowsPerPage: '~',
    minPaidPrice: 0,
  };

  await useTransaction().list(filterProps)
    .then((res) => {
      models.value = res.data['hydra:member'];
      sendData();
    })
    .finally(() => {
      loading.value = false;
    });
}

function sendData() {
  emit('retrieveData', modelsStats);
}

function getStats(transactions) {
  const stats = {
    productCost: [],
    periodCost: []
  };

  let totalProductCostPriceUsd = 0;
  let totalProductCostPriceUzs = 0;
  let totalPeriodCostPriceUsd = 0;
  let totalPeriodCostPriceUzs = 0;

  transactions?.forEach(transaction => {
    const title = transaction.description || 'Unknown Description';
    const paid = parseFloat(transaction.paidPrice) || 0;
    const currency = transaction.budget?.name || '';

    if (onlyShowSalary.value) {
      if(!title.toLowerCase().startsWith('payedcustomersalary')) {
        return;
      }
    } else {
      if (title.toLowerCase().includes('ayriboshlash') || title.toLowerCase().startsWith('payedcustomersalary')) {
        return;
      }
    }

    const isProduct = title.toLowerCase().includes('productcost');
    const category = isProduct ? 'productCost' : 'periodCost';

    let existing = stats[category].find(item => item.title === title);
    if (!existing) {
      existing = { title, price: { paidPriceUsd: 0, paidPriceUzs: 0 } };
      stats[category].push(existing);
    }

    if (currency === 'USD') {
      existing.price.paidPriceUsd += paid;
      isProduct ? totalProductCostPriceUsd += paid : totalPeriodCostPriceUsd += paid;
    } else if (currency === "SO'M") {
      existing.price.paidPriceUzs += paid;
      isProduct ? totalProductCostPriceUzs += paid : totalPeriodCostPriceUzs += paid;
    }
  });

  return {
    stats,
    totalProductCostPriceUsd,
    totalProductCostPriceUzs,
    totalPeriodCostPriceUsd,
    totalPeriodCostPriceUzs
  };
}

const modelsStats = computed(() => getStats(models.value));

const statsLabels = computed(() => ({
  productCost: `${t('productCost')}: ${formatFloatToInteger(roundToDecimal(modelsStats.value.totalProductCostPriceUsd))}$ & ${formatFloatToInteger(roundToDecimal(modelsStats.value.totalProductCostPriceUzs))} So'm`,
  periodCost: `${t('periodCost')}: ${formatFloatToInteger(roundToDecimal(modelsStats.value.totalPeriodCostPriceUsd))}$ & ${formatFloatToInteger(roundToDecimal(modelsStats.value.totalPeriodCostPriceUzs))} So'm`
}));

watch(props, () => {
  getModels();
}, { deep: true });

onMounted(() => {
  getModels();
});
</script>

<template>
  <q-toggle
    label="Maoshlar hisoboti"
    v-model="onlyShowSalary"
  />

  <q-card flat bordered class="q-pa-sm text-green q-mb-md">
    <q-card-section class="flex justify-between">
      <div class="text-h6 text-primary">{{ $t('menus.sideBar.expenses') }}</div>
      <refresh-button dense :action="getModels" />
    </q-card-section>

    <q-linear-progress v-if="loading" indeterminate color="primary" />
    <q-separator v-else />

    <q-expansion-item
      v-for="(state, index) in modelsStats.stats"
      :key="String(index)"
      expand-separator
      :label="statsLabels[index]"
      header-class="text-red text-h6"
    >
      <q-card class="text-h6">
        <div v-for="(modelName, index) in state" :key="index">
          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-card-section>
                {{
                  modelName.title.startsWith('other') || modelName.title.startsWith('productcost')
                    ? modelName.title.slice(modelName.title.startsWith('productcost') ? 11 : 6)
                    : $t('transaction.' + modelName.title.split(" ")[0]) + ': ' + modelName.title.trim().split(/\s+/).slice(1).join(" ")
                }}
              </q-card-section>
            </template>

            <template v-slot:after>
              <q-card-section class="text-red">
                -
                {{ modelName.price.paidPriceUsd ? `${formatFloatToInteger(roundToDecimal(modelName.price.paidPriceUsd))} $` : '' }}
                {{ modelName.price.paidPriceUzs ? `${formatFloatToInteger(roundToDecimal(modelName.price.paidPriceUzs))} so'm` : '' }}
              </q-card-section>
            </template>
          </q-splitter>
          <q-separator inset />
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section class="text-h6 text-primary">
      <div class="text-bold">USD: - {{ formatFloatToInteger(roundToDecimal(modelsStats.totalProductCostPriceUsd + modelsStats.totalPeriodCostPriceUsd)) }} $</div>
      <div class="text-bold">UZS: - {{ formatFloatToInteger(roundToDecimal(modelsStats.totalProductCostPriceUzs + modelsStats.totalPeriodCostPriceUzs)) }} So'm</div>
    </q-card-section>
  </q-card>
</template>
