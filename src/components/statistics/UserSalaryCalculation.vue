<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useAbout} from "stores/user/about.js";
import {useWorkEntries} from "stores/workEntries.js";
import {formatFloatToInteger, roundToDecimal} from "../../libraries/constants/defaults.js";
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
const items = ref([]);
const loading = ref(false);

// Salary data for currency info (received from SalaryInfo component)
const salaryData = ref([]);

let filters = ref({
  dateFrom: props.date.dateFrom,
  dateTo: props.date.dateTo,
  status: 'accepted',
  unitPrice: 0,
  rowsPerPage: '~',
  workerBy: ''
});

function getItems () {
  if (loading.value || !filters.value.workerBy || filters.value.workerBy === '') return;
  loading.value = true;
  repository.list({page: 1, rowsPerPage: '~', ...filters.value})
    .then((res) => {
      items.value = res.data['hydra:member'];
    })
    .finally(() => {
      loading.value = false;
    });
}

// Handle salary data from SalaryInfo component
function handleSalaryDataLoaded(data) {
  salaryData.value = data;
}

const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + Number(item.totalPrice), 0)
})

const totalItems = computed(() => {
  return items.value.reduce((sum, item) => sum + Number(item.quantity), 0)
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
  filters.value.dateFrom = props.date.dateFrom;
  filters.value.dateTo = props.date.dateTo;
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
          <div class="text-h4">{{ items.length }}</div>
          <div class="text-subtitle2">{{ $t('piece') }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <!-- Salary Info Component -->
  <salary-info
    :worker="filters.workerBy"
    :date="props.date"
    :total-earned="totalQuantity"
    @salary-data-loaded="handleSalaryDataLoaded"
    class="q-mb-lg"
  />
  <!-- Work Activity Table Component -->
  <work-activity-table
    :date="props.date"
    :worker-by="filters.workerBy"
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
