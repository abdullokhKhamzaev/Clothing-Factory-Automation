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
    type: Object,
    required: true,
  },
  totalEarned: {
    type: Number,
    default: 0,
    required: false
  }
})

// Emit salary data to parent
const emit = defineEmits(['salary-data-loaded'])

// Salary data
const salaryRepository = useSalary()
const salaryData = ref([])
const loading = ref(false)

function getSalaryData() {
  if (loading.value || !props.worker) return

  loading.value = true

  // Convert dateRange to month format for backend
  const dateFrom = props.date.dateFrom
  const month = dateFrom.substring(0, 7) // "2025-09-01" -> "2025-09"

  const salaryFilters = {
    month: month,
    worker: props.worker,
    page: 1,
    rowsPerPage: 10
  }

  salaryRepository.fetchSalaries(salaryFilters)
    .then((res) => {
      salaryData.value = res.data['hydra:member'] || []
      // Parent ga ma'lumot uzatish
      emit('salary-data-loaded', salaryData.value)
    })
    .catch((error) => {
      console.error('Salary data fetch error:', error)
      salaryData.value = []
      emit('salary-data-loaded', [])
    })
    .finally(() => {
      loading.value = false
    })
}

// Computed properties
const currentSalaryData = computed(() => {
  return salaryData.value.length > 0 ? salaryData.value[0] : null
})

// Determine salary type
const salaryType = computed(() => {
  if (!currentSalaryData.value) return 'none'

  const hasBaseSalary = Number(currentSalaryData.value.baseSalary) > 0
  const hasDailyWage = Number(currentSalaryData.value.dailyWage) > 0
  const hasPiecework = Number(currentSalaryData.value.pieceworkEarning) > 0

  if (hasBaseSalary || hasDailyWage) {
    return 'fixed' // Fixed salary
  } else if (hasPiecework) {
    return 'piecework' // Performance-based salary
  }
  return 'none'
})

// Currency information
const currencyInfo = computed(() => {
  return currentSalaryData.value?.budget || { name: 'SO\'M' }
})

// Calculate total earned amount based on period
const totalEarned = computed(() => {
  if (!currentSalaryData.value) return props.totalEarned

  // Parse data correctly
  const baseSalary = Number(currentSalaryData.value.baseSalary) || 0
  const dailyWage = Number(currentSalaryData.value.dailyWage) || 0
  const workedDays = Number(currentSalaryData.value.workedDays) || 0
  // const pieceworkEarning = Number(currentSalaryData.value.pieceworkEarning) || 0

  if (salaryType.value === 'fixed') {
    // Fixed salary calculation - divided by 2 for period (half month)
    const monthlyAmount = baseSalary > 0 ? baseSalary : (dailyWage * workedDays)
    return monthlyAmount / 2 // Half month for period
  } else if (salaryType.value === 'piecework') {
    // Performance-based calculation - use totalEarned from work entries for current period
    return props.totalEarned || 0
  }

  // Return 0 if no data available
  return 0
})

const pieceworkEarning = computed(() => {
  return totalEarned.value
})

// Calculate payment period based on work period
const getPaymentPeriod = (workPeriod) => {
  const workStart = new Date(workPeriod.dateFrom)
  const workDay = parseInt(workPeriod.dateFrom.substring(8, 10))

  let paymentStart, paymentEnd

  if (workDay === 1) {
    // Work period: 1-15, Payment period: 16-end of same month
    const year = workStart.getFullYear()
    const month = workStart.getMonth()
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

    paymentStart = new Date(year, month, 16)
    paymentEnd = new Date(year, month, lastDayOfMonth, 23, 59, 59, 999)
  } else {
    // Work period: 16-end, Payment period: 1-15 of next month
    const year = workStart.getFullYear()
    const month = workStart.getMonth()

    paymentStart = new Date(year, month + 1, 1)
    paymentEnd = new Date(year, month + 1, 15, 23, 59, 59, 999)
  }

  return { paymentStart, paymentEnd }
}

const paidAmount = computed(() => {
  if (!currentSalaryData.value || !currentSalaryData.value.transaction) return 0

  const { paymentStart, paymentEnd } = getPaymentPeriod(props.date)

  // Filter transactions by payment period date range
  const periodTransactions = currentSalaryData.value.transaction.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt)
    return transactionDate >= paymentStart && transactionDate <= paymentEnd
  })

  return periodTransactions.reduce((sum, t) => sum + parseFloat(t.price || 0), 0)
})

const lastPaymentAmount = computed(() => {
  if (!currentSalaryData.value || !currentSalaryData.value.transaction || currentSalaryData.value.transaction.length === 0) {
    return 0
  }

  const { paymentStart, paymentEnd } = getPaymentPeriod(props.date)

  // Filter transactions by payment period date range
  const periodTransactions = currentSalaryData.value.transaction.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt)
    return transactionDate >= paymentStart && transactionDate <= paymentEnd
  })

  if (periodTransactions.length === 0) return 0

  const sortedTransactions = [...periodTransactions].sort((a, b) =>
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
    return 'No Data'
  }

  const { paymentStart, paymentEnd } = getPaymentPeriod(props.date)

  // Filter transactions by payment period date range
  const periodTransactions = currentSalaryData.value.transaction.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt)
    return transactionDate >= paymentStart && transactionDate <= paymentEnd
  })

  if (periodTransactions.length === 0) return 'No Data'

  const sortedTransactions = [...periodTransactions].sort((a, b) =>
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
  <q-card
    class="salary-summary-card"
    :class="{
      'fixed-salary': salaryType === 'fixed',
      'piecework-salary': salaryType === 'piecework',
      'no-salary': salaryType === 'none'
    }"
  >
    <q-card-section>
      <div class="row items-start">
        <!-- Mobile: Full width, Desktop: 2/3 width -->
        <div class="col-12 col-lg-8">
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="account_balance_wallet" class="q-mr-sm" />
            {{ $t('salaryInfo.title') }}
            <q-chip
              :color="salaryType === 'fixed' ? 'secondary' : salaryType === 'piecework' ? 'primary' : 'grey'"
              text-color="white"
              size="sm"
              class="q-ml-sm"
            >
              <q-icon
                :name="salaryType === 'fixed' ? 'schedule' : salaryType === 'piecework' ? 'work' : 'info'"
                size="xs"
                class="q-mr-xs"
              />
              <span v-if="salaryType === 'fixed'">{{ $t('salaryInfo.types.fixed') }}</span>
              <span v-else-if="salaryType === 'piecework'">{{ $t('salaryInfo.types.piecework') }}</span>
              <span v-else>{{ $t('salaryInfo.types.none') }}</span>
              <q-tooltip v-if="salaryType !== 'none'" class="bg-white text-primary" :offset="[10, 10]">
                <div class="text-body2 q-mb-xs">
                  <strong v-if="salaryType === 'fixed'">💼 {{ $t('salaryInfo.tooltips.fixed.title') }}</strong>
                  <strong v-else>🎯 {{ $t('salaryInfo.tooltips.piecework.title') }}</strong>
                </div>
                <div class="text-caption">
                  <div v-if="salaryType === 'fixed'" class="q-gutter-y-xs">
                    <div v-if="currentSalaryData?.baseSalary && Number(currentSalaryData.baseSalary) > 0">
                      📅 {{ $t('salaryInfo.tooltips.fixed.monthly') }}
                    </div>
                    <div v-else-if="currentSalaryData?.dailyWage && Number(currentSalaryData.dailyWage) > 0">
                      📊 {{ $t('salaryInfo.tooltips.fixed.daily') }}
                    </div>
                    <div v-else>
                      ℹ️ {{ $t('salaryInfo.tooltips.fixed.general') }}
                    </div>
                  </div>
                  <div v-else>
                    🔢 {{ $t('salaryInfo.tooltips.piecework.description') }}
                  </div>
                </div>
              </q-tooltip>
            </q-chip>
            <q-spinner-dots v-if="loading" class="q-ml-sm" color="primary" size="sm" />
          </div>

          <!-- Modern Salary Info Cards -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-lg-6">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon
                    :name="salaryType === 'fixed' ? 'account_balance' : 'work_history'"
                    color="primary"
                    size="sm"
                    class="q-mr-sm"
                  />
                  <span class="text-subtitle2 text-grey-7">
                    {{ salaryType === 'fixed' ? $t('salaryInfo.cards.totalEarned.fixed') : $t('salaryInfo.cards.totalEarned.piecework') }}
                  </span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-primary q-mt-sm">
                  {{ formatFloatToInteger(pieceworkEarning) }} {{ currencyInfo.name }}
                </div>
                <!-- Agar fixed salary bo'lsa, qo'shimcha ma'lumot -->
                <div v-if="salaryType === 'fixed' && currentSalaryData" class="text-caption text-grey-6 q-mt-xs">
                  <div v-if="Number(currentSalaryData.baseSalary || 0) > 0" class="flex items-center q-gutter-xs">
                    <q-icon name="account_balance" size="xs" color="grey-6" />
                    <span>{{ $t('salaryInfo.details.monthlyRate') }}: {{ formatFloatToInteger(currentSalaryData.baseSalary) }} {{ currencyInfo.name }}</span>
                  </div>
                  <div v-else-if="Number(currentSalaryData.dailyWage || 0) > 0" class="flex items-center q-gutter-xs">
                    <q-icon name="today" size="xs" color="grey-6" />
                    <span>{{ formatFloatToInteger(currentSalaryData.dailyWage) }} {{ currencyInfo.name }}{{ $t('salaryInfo.details.dailyRate') }} × {{ currentSalaryData.workedDays }} kun</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-6">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="payments" color="positive" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">{{ $t('salaryInfo.cards.lastPayment') }}</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-positive q-mt-sm">
                  {{ formatFloatToInteger(lastPaymentAmount) }} {{ currencyInfo.name }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ lastPaymentDate === 'No Data' ? $t('salaryInfo.statuses.noData') : lastPaymentDate }}
                </div>
              </div>
            </div>

            <!-- Bonus yoki Qolgan summa -->
            <div class="col-12 col-sm-6 col-lg-6" v-if="bonusAmount > 0">
              <div class="salary-info-item bonus-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="star" color="amber" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">{{ $t('salaryInfo.cards.bonus') }}</span>
                  <q-chip :size="$q.screen.lt.sm ? 'xs' : 'sm'" color="amber" text-color="white" class="q-ml-sm">
                    <q-icon name="celebration" size="xs" class="q-mr-xs" />
                    {{ $t('salaryInfo.cards.bonus') }}!
                  </q-chip>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-amber q-mt-sm">
                  +{{ formatFloatToInteger(bonusAmount) }} {{ currencyInfo.name }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="celebration" size="xs" class="q-mr-xs" />
                  {{ $t('salaryInfo.details.bonusAwarded') }}
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-6" v-else-if="remainingAmount > 0">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="pending" color="warning" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">{{ $t('salaryInfo.cards.remaining') }}</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold text-warning q-mt-sm">
                  {{ formatFloatToInteger(remainingAmount) }} {{ currencyInfo.name }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="schedule" size="xs" class="q-mr-xs" />
                  {{ $t('salaryInfo.details.debtStatus') }}
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-6" v-else>
              <div class="salary-info-item q-pa-md q-pa-sm-sm" :class="pieceworkEarning === 0 ? 'no-data-item' : 'completed-item'">
                <div class="salary-info-header">
                  <q-icon
                    :name="pieceworkEarning === 0 ? 'info' : 'check_circle'"
                    :color="pieceworkEarning === 0 ? 'grey' : 'positive'"
                    size="sm"
                    class="q-mr-sm"
                  />
                  <span class="text-subtitle2 text-grey-7">{{ $t('salaryInfo.cards.status') }}</span>
                </div>
                <div class="salary-info-value text-h5 text-h6-sm text-weight-bold q-mt-sm" :class="pieceworkEarning === 0 ? 'text-grey-6' : 'text-positive'">
                  <span v-if="pieceworkEarning === 0">📄 {{ $t('salaryInfo.statuses.noData') }}</span>
                  <span v-else>✅ {{ $t('salaryInfo.statuses.fullyPaid') }}</span>
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <div v-if="pieceworkEarning === 0" class="flex items-center q-gutter-xs">
                    <q-icon name="info" size="xs" />
                    <span>{{ salaryType === 'fixed' ? $t('salaryInfo.details.noInfo') : $t('salaryInfo.details.notWorked') }}</span>
                  </div>
                  <div v-else class="flex items-center q-gutter-xs">
                    <q-icon name="check_circle" size="xs" />
                    <span>{{ $t('salaryInfo.details.allPaid') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-6 col-lg-6">
              <div class="salary-info-item q-pa-md q-pa-sm-sm">
                <div class="salary-info-header">
                  <q-icon name="trending_up" color="info" size="sm" class="q-mr-sm" />
                  <span class="text-subtitle2 text-grey-7">{{ $t('salaryInfo.cards.paymentStatus') }}</span>
                </div>
                <div class="salary-info-value q-mt-sm">
                  <div class="text-h6 text-subtitle1-sm text-weight-bold" :class="paymentPercentage === 100 ? 'text-positive' : paymentPercentage > 100 ? 'text-amber' : 'text-info'">
                    {{ paymentPercentage }}{{ paymentPercentage > 100 ? '+' : '' }}%
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs flex items-center q-gutter-xs">
                    <q-icon
                      :name="paymentPercentage > 100 ? 'star' : paymentPercentage === 100 ? 'check_circle' : 'timelapse'"
                      size="xs"
                    />
                    <span>
                      {{ paymentPercentage > 100 ? $t('salaryInfo.statuses.withBonus') : paymentPercentage === 100 ? $t('salaryInfo.statuses.fullyPaid') : $t('salaryInfo.statuses.inProgress') }}
                    </span>
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
              {{ paymentPercentage > 100 ? $t('salaryInfo.cards.bonus') : $t('paid') }}
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
                📄 {{ salaryType === 'fixed' ? $t('salaryInfo.details.noInfo') : $t('salaryInfo.statuses.noData') }}
              </span>
              <span v-else-if="paymentPercentage > 100">
                🎉 {{ $t('salaryInfo.statuses.withBonus') }}
              </span>
              <span v-else-if="paymentPercentage === 100">
                ✅ {{ $t('salaryInfo.statuses.fullyPaid') }}
              </span>
              <span v-else-if="paymentPercentage > 50">
                ⏳ {{ $t('salaryInfo.statuses.partiallyPaid') }}
              </span>
              <span v-else>
                🔴 {{ $t('salaryInfo.statuses.notPaid') }}
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

/* Salary type specific colors - only border colors */
.salary-summary-card.fixed-salary {
  border-left-color: #9c27b0;
}

.salary-summary-card.piecework-salary {
  border-left-color: #2196f3;
}

.salary-summary-card.no-salary {
  border-left-color: #9e9e9e;
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
