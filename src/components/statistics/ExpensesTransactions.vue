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
  emit('retrieveData', 'fopo')
}

function getStats(transactions) {
  const stats = {};
  let totalPriceUsd = 0;
  let totalPriceUzs = 0;

  if (transactions) {
    transactions.forEach(transaction => {
      const title = transaction.description || 'Unknown Description';
      const paid = parseFloat(transaction.paidPrice) || 0;
      const currency = transaction.budget?.name || '';

      // Skip if description contains 'ayriboshlash' (case-insensitive)
      if (title.toLowerCase().includes('ayriboshlash')) {
        return;
      }

      if (!stats[title]) {
        stats[title] = { paidPriceUsd: 0, paidPriceUzs: 0 };
      }

      if (currency === 'USD') {
        stats[title].paidPriceUsd += paid;
        totalPriceUsd += paid;
      } else if (currency === "SO'M") {
        stats[title].paidPriceUzs += paid;
        totalPriceUzs += paid;
      }
    });
  }

  return { stats, totalPriceUsd, totalPriceUzs };
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
      expand-separator
      label="Qo'shimcha ma'lumotlar"
      header-class="text-primary"
    >
      <q-card>
        <div v-for="(count, modelName) in modelsStats.stats" :key="modelName">
          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-card-section>{{ modelName.startsWith('other') ? modelName.slice(6) : $t('transaction.' + modelName.split(" ")[0]) + ': ' + modelName.trim().split(/\s+/).slice(1).join(" ")}}</q-card-section>
            </template>

            <template v-slot:after>
              <q-card-section class="text-red">- {{ count?.paidPriceUsd ? `${count.paidPriceUsd} $` : '' }} {{ count?.paidPriceUzs ? `${count.paidPriceUzs} so'm` : '' }} </q-card-section>
            </template>
          </q-splitter>
          <q-separator inset />
        </div>
      </q-card>
    </q-expansion-item>

    <q-card-section class="text-h6 text-primary">
      <div class="text-bold">USD: - {{ formatFloatToInteger(modelsStats.totalPriceUsd) }} $</div>
      <div class="text-bold">UZS: - {{ formatFloatToInteger(modelsStats.totalPriceUzs) }} So'm</div>
    </q-card-section>
  </q-card>
</template>
