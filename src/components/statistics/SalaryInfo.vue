<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useSalary} from "stores/salary.js"
import {formatDate, formatFloatToInteger} from "../../libraries/constants/defaults.js"

const props = defineProps({
  worker: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  totalEarned: {
    type: Number,
    default: 0,
    required: false
  }
})

// Salary data
const salaryRepository = useSalary()
const salaryData = ref([])
const loading = ref(false)

function getSalaryData() {
  if (loading.value || !props.worker) return

  loading.value = true

  const salaryFilters = {
    month: props.date,
    worker: props.worker,
    page: 1,
    rowsPerPage: 10
  }

  salaryRepository.fetchSalaries(salaryFilters)
    .then((res) => {
      salaryData.value = res.data['hydra:member'] || []
    })
    .catch((error) => {
      console.error('Salary data fetch error:', error)
      salaryData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// Computed properties
const currentSalaryData = computed(() => {
  return salaryData.value.length > 0 ? salaryData.value[0] : null
})

const pieceworkEarning = computed(() => {
  return currentSalaryData.value
    ? parseFloat(currentSalaryData.value.pieceworkEarning || 0)
    : props.totalEarned
})

const paidAmount = computed(() => {
  if (!currentSalaryData.value || !currentSalaryData.value.transaction) return 0
  return currentSalaryData.value.transaction.reduce((sum, t) => sum + parseFloat(t.price || 0), 0)
})

const lastPaymentAmount = computed(() => {
  if (!currentSalaryData.value || !currentSalaryData.value.transaction || currentSalaryData.value.transaction.length === 0) {
    return 0
  }
  const sortedTransactions = [...currentSalaryData.value.transaction].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )
  return parseFloat(sortedTransactions[0]?.price || 0)
})

const bonusAmount = computed(() => {
  const earned = pieceworkEarning.value
  return Math.max(0, paidAmount.value - earned)
})

const remainingAmount = computed(() => {
  const earned = pieceworkEarning.value
  return Math.max(0, earned - paidAmount.value)
})

const paymentPercentage = computed(() => {
  const earned = pieceworkEarning.value
  if (earned === 0) return 0
  const percentage = (paidAmount.value / earned) * 100
  return Math.floor(percentage)
})

const lastPaymentDate = computed(() => {
  if (!currentSalaryData.value || !currentSalaryData.value.transaction || currentSalaryData.value.transaction.length === 0) {
    return 'Ma\'lumot yo\'q'
  }
  const sortedTransactions = [...currentSalaryData.value.transaction].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )
  return formatDate(sortedTransactions[0]?.createdAt || '').slice(0, 10)
})

// Watch for prop changes
watch([() => props.worker, () => props.date], () => {
  getSalaryData()
}, {deep: true})

onMounted(() => {
  getSalaryData()
})
</script>

<template>
  <q-card class="salary-summary-card">
    <q-card-section>
      <div class="row items-start">
        <!-- Mobile: Full width, Desktop: 2/3 width -->
        <div class="col-12 col-lg-8">
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="account_balance_wallet" class="q-mr-sm" />
            Maosh haqida ma'lumot
            <q-spinner-dots v-if="loading" class="q-ml-sm" color="primary" size="sm" />
          </div>

          <!-- Modern Salary Info Cards -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-6">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="work_history" color="primary" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">Ishlangan summasi</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-primary q-mt-sm">
                  {{ formatFloatToInteger(pieceworkEarning) }} SO'M
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-6">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="payments" color="positive" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">So'nggi to'lov</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-positive q-mt-sm">
                  {{ formatFloatToInteger(lastPaymentAmount) }} SO'M
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">{{ lastPaymentDate }}</div>
              </div>
            </div>

            <!-- Bonus yoki Qolgan summa -->
            <div class="col-12 col-sm-6 col-md-6" v-if="bonusAmount > 0">
              <div class="salary-info-item bonus-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="star" color="amber" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">Bonus</span>
                  <q-chip :size="$q.screen.lt.sm ? 'xs' : 'sm'" color="amber" text-color="white" class="q-ml-sm">
                    <q-icon name="celebration" size="xs" class="q-mr-xs" />
                    Extra!
                  </q-chip>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-amber q-mt-sm">
                  +{{ formatFloatToInteger(bonusAmount) }} SO'M
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">Ajoyib ish uchun mukofot! 🎉</div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-6" v-else-if="remainingAmount > 0">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="pending" color="warning" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">Qolgan summa</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-warning q-mt-sm">
                  {{ formatFloatToInteger(remainingAmount) }} SO'M
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">To'lanishi kerak</div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-6" v-else>
              <div class="salary-info-item q-pa-md q-pa-sm-sm" :class="pieceworkEarning === 0 ? 'no-data-item' : 'completed-item'">
                <div class="salary-info-header">
                  <q-icon
                    :name="pieceworkEarning === 0 ? 'info' : 'check_circle'"
                    :color="pieceworkEarning === 0 ? 'grey' : 'positive'"
                    size="sm"
                    class="q-mr-sm"
                  />
                  <span class="text-subtitle2 text-grey-7">Holat</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold q-mt-sm" :class="pieceworkEarning === 0 ? 'text-grey-6' : 'text-positive'">
                  <span v-if="pieceworkEarning === 0">📄 Ma'lumot yo'q</span>
                  <span v-else>✅ To'liq to'langan</span>
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <span v-if="pieceworkEarning === 0">Hali ish bajarilmagan</span>
                  <span v-else>Barcha to'lovlar amalga oshirildi</span>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-md-6">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="trending_up" color="info" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">To'lov holati</span>
                </div>
                <div class="salary-info-value q-mt-sm">
                  <div class="text-h6 text-subtitle1-sm text-weight-bold" :class="paymentPercentage === 100 ? 'text-positive' : paymentPercentage > 100 ? 'text-amber' : 'text-info'">
                    {{ paymentPercentage }}{{ paymentPercentage > 100 ? '+' : '' }}%
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    {{ paymentPercentage > 100 ? 'Bonus bilan' : paymentPercentage === 100 ? 'To\'liq to\'langan' : 'Jarayonda' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: Full width, Desktop: 1/3 width -->
        <div class="col-12 col-lg-4 text-center q-pt-lg q-pt-lg-none">
          <q-circular-progress
            show-value
            :value="Math.min(100, paymentPercentage)"
            :size="$q.screen.lt.md ? '80px' : '120px'"
            :thickness="0.15"
            :color="paymentPercentage > 100 ? 'amber' : paymentPercentage === 100 ? 'positive' : 'primary'"
            track-color="grey-3"
            class="q-ma-sm q-ma-md-md"
          >
            <div class="text-h6 text-weight-bold">
              {{ paymentPercentage }}{{ paymentPercentage > 100 ? '+' : '' }}%
            </div>
            <div class="text-caption text-grey-7">
              {{ paymentPercentage > 100 ? 'Bonus' : 'To\'landi' }}
            </div>
          </q-circular-progress>
          <div class="q-mt-md">
            <q-chip
              :color="pieceworkEarning === 0 ? 'grey' : paymentPercentage > 100 ? 'amber' : paymentPercentage === 100 ? 'positive' : paymentPercentage > 50 ? 'warning' : 'negative'"
              text-color="white"
              :icon="pieceworkEarning === 0 ? 'info' : paymentPercentage > 100 ? 'star' : paymentPercentage === 100 ? 'check_circle' : paymentPercentage > 50 ? 'schedule' : 'error'"
              :size="$q.screen.lt.md ? 'sm' : 'md'"
              class="animated-pulse"
            >
              <span v-if="pieceworkEarning === 0">
                📄 Ma'lumot yo'q
              </span>
              <span v-else-if="paymentPercentage > 100">
                🎉 Bonus bilan to'langan
              </span>
              <span v-else-if="paymentPercentage === 100">
                ✅ To'liq to'langan
              </span>
              <span v-else-if="paymentPercentage > 50">
                ⏳ Qisman to'langan
              </span>
              <span v-else>
                ❌ To'lanmagan
              </span>
            </q-chip>
          </div>
          </div>
        </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.salary-summary-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #2196f3;
}

.salary-info-item {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.15);
  transition: all 0.2s ease;
  height: 100%;
}

.salary-info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2196f3;
}

.salary-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.salary-info-value {
  margin-top: 4px;
}

.bonus-item {
  background: rgba(255, 193, 7, 0.15) !important;
  border: 1px solid #ffc107 !important;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.4) !important;
}

.bonus-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, #ffc107, #ff9800, #ffc107, transparent);
  animation: shimmer 1.8s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.bonus-item:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.5) !important;
  border-color: #ffb300 !important;
}

.completed-item {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50 !important;
}

.completed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.2);
}

.no-data-item {
  background: rgba(158, 158, 158, 0.1);
  border: 1px solid rgba(158, 158, 158, 0.3) !important;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

/* Quasar handles all responsive behavior through utility classes */
.animated-pulse {
  animation: pulse 2s infinite;
}
</style>
