<script setup>
import {computed, onMounted, ref, watch} from "vue"
import {useSalary} from "stores/salary.js"
import {useAttendance} from "stores/attendance.js"
import {formatDate, formatFloatToInteger} from "../../libraries/constants/defaults.js"
import {periodFromDateFrom, splitEarnedByPeriod, allocatePayments} from "src/libraries/salaryPeriod.js"
import SalaryPaymentsList from "components/SalaryPaymentsList.vue"

const props = defineProps({
  worker: {
    type: String,
    required: true,
  },
  date: {
    type: Object,
    required: true,
  },
  // BUTUN oyning tasdiqlangan ish yozuvlari (parent bir marta oladi) —
  // FIFO taqsimot ikkala davrning ishlanganini bilishi kerak
  monthEntries: {
    type: Array,
    default: () => []
  }
})

// Emit salary data to parent
const emit = defineEmits(['salary-data-loaded'])

// Salary data
const salaryRepository = useSalary()
const attendanceRepository = useAttendance()
const salaryData = ref([])
// Oyning jarima yozilgan davomat kunlari (shaffoflik uchun birma-bir ko'rsatiladi)
const monthCuts = ref([])
const loading = ref(false)
// Oy almashgandagina qayta so'raymiz (davr 1↔2 almashishi so'rov talab qilmaydi)
let fetchedKey = ''

function getSalaryData() {
  if (loading.value || !props.worker) return

  // Convert dateRange to month format for backend
  const dateFrom = props.date.dateFrom
  const month = dateFrom.substring(0, 7) // "2025-09-01" -> "2025-09"

  const key = `${props.worker}|${month}`
  if (key === fetchedKey) return

  loading.value = true

  const [year, monthNum] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNum, 0).getDate()

  const salaryFilters = {
    month: month,
    worker: props.worker,
    page: 1,
    rowsPerPage: 10
  }

  const attendanceFilters = {
    worker: props.worker,
    dateFrom: `${month}-01`,
    dateTo: `${month}-${String(lastDay).padStart(2, '0')}`,
    rowsPerPage: '~'
  }

  Promise.all([
    salaryRepository.fetchSalaries(salaryFilters),
    attendanceRepository.fetchAttendances(attendanceFilters)
  ])
    .then(([salaryRes, attendanceRes]) => {
      salaryData.value = salaryRes.data['hydra:member'] || []
      monthCuts.value = (attendanceRes?.data?.['hydra:member'] || [])
        .filter(a => Number(a.cutMoney) > 0)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      fetchedKey = key
      // Parent ga ma'lumot uzatish
      emit('salary-data-loaded', salaryData.value)
    })
    .catch((error) => {
      console.error('Salary data fetch error:', error)
      salaryData.value = []
      monthCuts.value = []
      emit('salary-data-loaded', [])
    })
    .finally(() => {
      loading.value = false
    })
}

const cutsTotal = computed(() => monthCuts.value.reduce((sum, a) => sum + Number(a.cutMoney || 0), 0))

// Davomatda yozilgan, lekin oylik hisobiga QO'LLANMAGAN jarimalar farqi.
// (Jarima faqat ketish belgilash oqimida oylikdan ayiriladi; keyin/boshqa yo'l
// bilan kiritilgani yozuv bo'lib qoladi — farqni yashirmasdan ko'rsatamiz)
const unappliedCuts = computed(() => {
  if (!dailyBreakdown.value) return 0
  const diff = cutsTotal.value - dailyBreakdown.value.penalty
  return diff > 0.01 ? diff : 0
})

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

// Tanlangan davr: 1 (1–15) yoki 2 (16 – oy oxiri)
const selectedPeriod = computed(() => periodFromDateFrom(props.date?.dateFrom) || 1)

// Davriy qo'shimcha to'lov (yo'l kira, lazer...) — har 15 kunlik davr uchun
const extraPerPeriod = computed(() => Number(currentSalaryData.value?.worker?.extraPayment) || 0)
const extraReason = computed(() => currentSalaryData.value?.worker?.extraPaymentReason || '')

// Kunlik ishchi uchun shaffof taqsimot: stavka x kunlar - jarima = jami.
// Ishchi o'zi ham ko'radi — tushunmovchilik/janjal bo'lmasligi uchun
const dailyBreakdown = computed(() => {
  const s = currentSalaryData.value
  if (!s) return null
  const rate = Number(s.worker?.salary) || 0
  const days = Number(s.workedDays) || 0
  const total = Number(s.dailyWage) || 0
  if (rate <= 0 || days <= 0 || total <= 0) return null
  return { rate, days, penalty: Math.max(0, rate * days - total), total }
})

// Har bir davrning hisoblangan summasi.
// Ishbay: oy yozuvlaridan sanasi bo'yicha bo'linadi; belgilangan/kunlik: oylik ikkiga teng bo'linadi.
// Qo'shimcha to'lov ISHLAGAN davrga qo'shiladi (ishbayda — o'sha davrda ishi bo'lsa,
// belgilangan oylikda — har doim), bo'sh davrga soxta qarz yozilmaydi
const earnedByPeriod = computed(() => {
  const extra = extraPerPeriod.value

  if (salaryType.value === 'fixed' && currentSalaryData.value) {
    const baseSalary = Number(currentSalaryData.value.baseSalary) || 0
    // DIQQAT: dailyWage — kunlik stavka emas, davomatdan YIG'ILGAN oy jami
    // (har kelgan kunda stavka qo'shiladi, jarimalar ayirilgan) — ko'paytirilmaydi
    const dailyWage = Number(currentSalaryData.value.dailyWage) || 0
    const monthlyAmount = baseSalary > 0 ? baseSalary : dailyWage
    return {
      period1: monthlyAmount / 2 + extra,
      period2: monthlyAmount / 2 + extra
    }
  }

  const earned = splitEarnedByPeriod(props.monthEntries)
  return {
    period1: earned.period1 > 0 ? earned.period1 + extra : 0,
    period2: earned.period2 > 0 ? earned.period2 + extra : 0
  }
})

// FIFO: oy to'lovlari xronologik tartibda avval 1-davr qarzini yopadi, ortgani 2-davrga
const allocation = computed(() =>
  allocatePayments(earnedByPeriod.value, currentSalaryData.value?.transaction)
)

const pieceworkEarning = computed(() => {
  return selectedPeriod.value === 1 ? earnedByPeriod.value.period1 : earnedByPeriod.value.period2
})

const paidAmount = computed(() => {
  const alloc = allocation.value
  return selectedPeriod.value === 1 ? alloc.period1.paid : alloc.period2.paid
})

// Tanlangan davrga pul tekkan oxirgi to'lov
const lastPeriodTx = computed(() => {
  const alloc = allocation.value
  return selectedPeriod.value === 1 ? alloc.period1.lastTx : alloc.period2.lastTx
})

const lastPaymentAmount = computed(() => parseFloat(lastPeriodTx.value?.price || 0))

const remainingAmount = computed(() => {
  return Math.max(0, pieceworkEarning.value - paidAmount.value)
})

// Bonus (ortiqcha to'lov) faqat ikkala davr ham to'liq yopilgandan keyin paydo bo'ladi —
// tanlangan davr to'liq to'langan bo'lsa ko'rsatamiz
const bonusAmount = computed(() => {
  return remainingAmount.value === 0 ? allocation.value.bonus : 0
})

const paymentPercentage = computed(() => {
  const earned = pieceworkEarning.value
  if (earned === 0) return 0
  const percentage = ((paidAmount.value + bonusAmount.value) / earned) * 100
  return Math.floor(percentage)
})

const lastPaymentDate = computed(() => {
  if (!lastPeriodTx.value) return 'No Data'
  return formatDate(lastPeriodTx.value.createdAt || '').slice(0, 10)
})

// Oyning barcha to'lovlari (eng yangisi tepada) — ishchi ham o'zinikini ko'radi
const monthPayments = computed(() => {
  return [...(currentSalaryData.value?.transaction || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
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
                  <div v-else-if="dailyBreakdown" class="q-gutter-xs">
                    <div class="flex items-center q-gutter-xs">
                      <q-icon name="today" size="xs" color="grey-6" />
                      <span>{{ formatFloatToInteger(dailyBreakdown.rate) }} {{ currencyInfo.name }} × {{ dailyBreakdown.days }} kun = {{ formatFloatToInteger(dailyBreakdown.rate * dailyBreakdown.days) }}</span>
                    </div>
                    <div v-if="dailyBreakdown.penalty > 0" class="flex items-center q-gutter-xs text-negative">
                      <q-icon name="remove_circle_outline" size="xs" color="negative" />
                      <span>{{ $t('salaryInfo.details.appliedPenalty') }}: −{{ formatFloatToInteger(dailyBreakdown.penalty) }} → {{ $t('salaryInfo.details.monthTotal') }} {{ formatFloatToInteger(dailyBreakdown.total) }} {{ currencyInfo.name }}</span>
                    </div>
                    <div class="flex items-center q-gutter-xs">
                      <q-icon name="date_range" size="xs" color="grey-6" />
                      <span>{{ $t('salaryInfo.details.periodShare') }} ({{ selectedPeriod === 1 ? '1–15' : '16–' }}): {{ formatFloatToInteger(dailyBreakdown.total / 2) }} {{ currencyInfo.name }}</span>
                    </div>
                  </div>
                  <div v-else-if="Number(currentSalaryData.dailyWage || 0) > 0" class="flex items-center q-gutter-xs">
                    <q-icon name="today" size="xs" color="grey-6" />
                    <span>{{ formatFloatToInteger(currentSalaryData.dailyWage) }} {{ currencyInfo.name }} — {{ currentSalaryData.workedDays }} kun davomat</span>
                  </div>
                </div>
                <!-- Qo'shimcha to'lov (yo'l kira, lazer...) hisobga kiritilgan bo'lsa -->
                <div v-if="extraPerPeriod > 0 && pieceworkEarning > 0" class="text-caption text-amber-9 q-mt-xs flex items-center q-gutter-xs">
                  <q-icon name="add_circle" size="xs" color="amber-8" />
                  <span>{{ $t('salaryInfo.details.extraIncluded') }}: +{{ formatFloatToInteger(extraPerPeriod) }} {{ currencyInfo.name }}<template v-if="extraReason"> ({{ extraReason }})</template></span>
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

      <!-- Oy to'lovlari tarixi: qachon, qancha, kim to'lagan -->
      <q-expansion-item
        v-if="monthPayments.length"
        icon="receipt_long"
        :label="`${$t('salaryInfo.paymentsHistory')} (${monthPayments.length})`"
        header-class="text-primary text-weight-medium"
        class="q-mt-md"
      >
        <div class="q-pa-sm">
          <salary-payments-list :lists="monthPayments" />
        </div>
      </q-expansion-item>

      <!-- Jarimalar birma-bir: qaysi kuni, qancha — ishchi ham ko'radi, savol qolmaydi -->
      <q-expansion-item
        v-if="monthCuts.length"
        icon="gavel"
        :label="`${$t('salaryInfo.penaltiesHistory')} (${monthCuts.length}) — −${formatFloatToInteger(cutsTotal)} ${currencyInfo.name}`"
        header-class="text-negative text-weight-medium"
        class="q-mt-sm"
      >
        <q-list bordered separator class="q-ma-sm" style="max-width: 360px">
          <q-item v-for="cut in monthCuts" :key="cut.id">
            <q-item-section>
              <div class="flex justify-between">
                <span>{{ formatDate(cut.date).slice(0, 10) }}</span>
                <span class="text-negative text-weight-bold">−{{ formatFloatToInteger(cut.cutMoney) }} {{ currencyInfo.name }}</span>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <!-- Davomat yozuvi va oylik hisobi mos kelmasa — yashirmaymiz, ochiq aytamiz -->
        <q-banner v-if="unappliedCuts > 0" dense class="bg-orange-1 text-orange-10 q-ma-sm" rounded>
          <template v-slot:avatar><q-icon name="warning" color="orange" /></template>
          −{{ formatFloatToInteger(unappliedCuts) }} {{ currencyInfo.name }} {{ $t('salaryInfo.penaltiesUnapplied') }}
        </q-banner>
      </q-expansion-item>
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
