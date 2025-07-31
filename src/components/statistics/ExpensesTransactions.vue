<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useTransaction} from "stores/transaction.js";
import RefreshButton from "components/RefreshButton.vue";
import {formatFloatToInteger} from "../../libraries/constants/defaults.js";

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

const emit = defineEmits(['retrieveData']);

const splitterModel = ref(50);

// Accepted Orders
const models = ref([]);
const loading = ref(false);
async function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.createdAtFrom = props.dateFrom + 'T00:00:00';
  filterProps.createdAtTo = props.dateTo + 'T23:59:59';
  filterProps.isIncome = false;
  filterProps.rowsPerPage = '~';
  filterProps.minPaidPrice = 0;

  await useTransaction().list(filterProps || '')
    .then((res) => {
      models.value = res.data['hydra:member'];
      sendData();
    })
    .finally(() => {
      loading.value = false;
    });
}

function sendData() {
  emit('retrieveData', modelsStats)
}

function getStats(transactions) {
  let stats = {
    productCost: [],
    periodCost: []
  };

  let totalProductCostPriceUsd = 0;
  let totalProductCostPriceUzs = 0;
  let totalPeriodCostPriceUsd = 0;
  let totalPeriodCostPriceUzs = 0;

  if (transactions) {
    transactions.forEach(transaction => {
      const title = transaction.description || 'Unknown Description';
      const paid = parseFloat(transaction.paidPrice) || 0;
      const currency = transaction.budget?.name || '';

      // Skip if description contains 'ayriboshlash' (case-insensitive)
      if (title.toLowerCase().includes('ayriboshlash')) {
        return;
      }

      const isProduct = title.toLowerCase().includes('productcost');
      const category = isProduct ? 'productCost' : 'periodCost';

      // Check if the title already exists in the selected category
      let existing = stats[category].find(item => item.title === title);
      if (!existing) {
        existing = { title, price: { paidPriceUsd: 0, paidPriceUzs: 0 } };
        stats[category].push(existing);
      }

      // Update the existing record and totals
      if (currency === 'USD') {
        existing.price.paidPriceUsd += paid;
        if (isProduct) {
          totalProductCostPriceUsd += paid;
        } else {
          totalPeriodCostPriceUsd += paid;
        }
      } else if (currency === "SO'M") {
        existing.price.paidPriceUzs += paid;
        if (isProduct) {
          totalProductCostPriceUzs += paid;
        } else {
          totalPeriodCostPriceUzs += paid;
        }
      }
    });
  }

  return {
    stats,
    totalProductCostPriceUsd,
    totalProductCostPriceUzs,
    totalPeriodCostPriceUsd,
    totalPeriodCostPriceUzs
  };
}

const modelsStats = computed(() => getStats(models.value));

watch(props, () => {
  getModels();
}, {deep: true})

onMounted(() => {
  getModels()
})
</script>

<template>
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
      :label="index === 'productCost' ? `${$t('productCost')}: ${formatFloatToInteger(modelsStats.totalProductCostPriceUsd)}$ & ${formatFloatToInteger(modelsStats.totalProductCostPriceUzs)}So'm` : `${$t(index)}: ${formatFloatToInteger(modelsStats.totalPeriodCostPriceUsd)}$ & ${formatFloatToInteger(modelsStats.totalPeriodCostPriceUzs)}So'm` "
      header-class="text-red text-h6"
    >
      <q-card class="text-h6">
        <div v-for="(modelName, index) in state" :key="index">
          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-card-section>{{ modelName.title.startsWith('other') ? modelName.title.slice(6) : $t('transaction.' + modelName.title.split(" ")[0]) + ': ' + modelName.title.trim().split(/\s+/).slice(1).join(" ")}}</q-card-section>
            </template>

            <template v-slot:after>
              <q-card-section class="text-red">- {{ modelName.price.paidPriceUsd ? `${modelName.price.paidPriceUsd} $` : '' }} {{ modelName.price.paidPriceUzs ? `${modelName.price.paidPriceUzs} so'm` : '' }} </q-card-section>
            </template>
          </q-splitter>
          <q-separator inset />
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section class="text-h6 text-primary">
      <div class="text-bold">USD: - {{ formatFloatToInteger(modelsStats.totalProductCostPriceUsd + modelsStats.totalPeriodCostPriceUsd) }} $</div>
      <div class="text-bold">UZS: - {{ formatFloatToInteger(modelsStats.totalProductCostPriceUzs + modelsStats.totalPeriodCostPriceUzs) }} So'm</div>
    </q-card-section>
  </q-card>
</template>
