<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useAbout} from "stores/user/about.js";
import {useWorkEntries} from "stores/workEntries.js";
import {formatFloatToInteger, roundToDecimal} from "../../libraries/constants/defaults.js";
import {periodFromDateFrom} from "src/libraries/salaryPeriod.js";
import {useRoute} from "vue-router";
import SalaryInfo from "components/statistics/SalaryInfo.vue";
import WorkActivityTable from "components/statistics/WorkActivityTable.vue";

const user = useAbout();
const route = useRoute();
const props = defineProps({
  date: {
    type: Object,
    required: true,
  }
})

// Table data for summary cards only
const repository = useWorkEntries();
// BUTUN oyning tasdiqlangan yozuvlari — kartalar tanlangan davr bo'yicha
// client-side kesib olinadi, SalaryInfo esa FIFO uchun to'liq oyni ishlatadi.
// Davr (1-15 ↔ 16-oxiri) almashganda qayta so'rov KETMAYDI — oy o'zgargandagina
const items = ref([]);
const loading = ref(false);
let fetchedKey = ''; // 'workerIri|YYYY-MM'

// Salary data for currency info (received from SalaryInfo component)
const salaryData = ref([]);

let filters = ref({
  workerBy: ''
});

function getItems (force = false) {
  const workerBy = filters.value.workerBy;
  const month = (props.date?.dateFrom || '').substring(0, 7);
  if (loading.value || !workerBy || !month) return;

  const key = `${workerBy}|${month}`;
  if (!force && key === fetchedKey) return;

  loading.value = true;

  const [year, monthNum] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();

  repository.list({
    page: 1,
    rowsPerPage: '~',
    status: 'accepted',
    workerBy,
    dateFrom: `${month}-01T00:00:00`,
    dateTo: `${month}-${String(lastDay).padStart(2, '0')}T23:59:59`
  })
    .then((res) => {
      items.value = res.data['hydra:member'];
      fetchedKey = key;
    })
    .finally(() => {
      loading.value = false;
    });
}

// Tanlangan 15 kunlik davrga tegishli yozuvlar (kartalar uchun)
const selectedPeriod = computed(() => periodFromDateFrom(props.date?.dateFrom) || 1);
const periodItems = computed(() => items.value.filter((entry) => {
  const day = parseInt(String(entry.createdAt || '').substring(8, 10), 10);
  return selectedPeriod.value === 1 ? day <= 15 : day > 15;
}));

// Handle salary data from SalaryInfo component
function handleSalaryDataLoaded(data) {
  salaryData.value = data;
}

const totalQuantity = computed(() => {
  return periodItems.value.reduce((sum, item) => sum + Number(item.totalPrice), 0)
})

const totalItems = computed(() => {
  return periodItems.value.reduce((sum, item) => sum + Number(item.quantity), 0)
})

const averagePrice = computed(() => {
  if (totalItems.value === 0) return 0
  return formatFloatToInteger(roundToDecimal(totalQuantity.value / totalItems.value))
})

// Currency information from salary data
const currencyInfo = computed(() => {
  if (salaryData.value.length > 0 && salaryData.value[0].budget) {
    return salaryData.value[0].budget;
  }
  return { name: 'SO\'M' };
})

watch([user, props], () => {
  filters.value.workerBy = route.params.id ? route.params.id : user.about['@id'];
  getItems();
}, {deep: true});

onMounted(async () => {
  await user.fetchAbout();
})
</script>

<template>
  <!-- Summary Cards -->
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-12 col-sm-6 col-md-6 col-lg-3">
      <q-card class="summary-card bg-primary text-white">
        <q-card-section>
          <div class="flex items-center justify-between q-mb-sm">
            <div class="text-h6">{{ $t('total') }}</div>
            <q-icon name="account_balance_wallet" size="md" class="text-white" style="opacity: 0.8" />
          </div>
          <div class="text-h4">{{ formatFloatToInteger(totalQuantity) }}</div>
          <div class="text-subtitle2">{{ currencyInfo.name }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-6 col-lg-3">
      <q-card class="summary-card bg-positive text-white">
        <q-card-section>
          <div class="flex items-center justify-between q-mb-sm">
            <div class="text-h6">{{ $t('tables.workEntry.columns.quantity') }}</div>
            <q-icon name="inventory" size="md" class="text-white" style="opacity: 0.8" />
          </div>
          <div class="text-h4">{{ totalItems }}</div>
          <div class="text-subtitle2">{{ $t('piece') }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-6 col-lg-3">
      <q-card class="summary-card bg-info text-white">
        <q-card-section>
          <div class="flex items-center justify-between q-mb-sm">
            <div class="text-h6">{{ $t('averagePrice') }}</div>
            <q-icon name="trending_up" size="md" class="text-white" style="opacity: 0.8" />
          </div>
          <div class="text-h4">{{ averagePrice }}</div>
          <div class="text-subtitle2">{{ currencyInfo.name }}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-6 col-lg-3">
      <q-card class="summary-card bg-warning text-white">
        <q-card-section>
          <div class="flex items-center justify-between q-mb-sm">
            <div class="text-h6">{{ $t('workCount') }}</div>
            <q-icon name="assignment" size="md" class="text-white" style="opacity: 0.8" />
          </div>
          <div class="text-h4">{{ periodItems.length }}</div>
          <div class="text-subtitle2">{{ $t('piece') }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <!-- Salary Info Component -->
  <salary-info
    :worker="filters.workerBy"
    :date="props.date"
    :month-entries="items"
    @salary-data-loaded="handleSalaryDataLoaded"
    class="q-mb-lg"
  />
  <!-- Work Activity Table Component: ma'lumot tepadagi yagona oy so'rovidan -->
  <work-activity-table
    :entries="periodItems"
    :loading="loading"
    @refresh="getItems(true)"
  />
</template>

<style scoped>
.summary-card {
  height: 120px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>
