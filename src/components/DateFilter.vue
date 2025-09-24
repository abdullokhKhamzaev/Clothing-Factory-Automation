<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['date-changed'])

const props = defineProps({
  modelValue: {
    type: String,
    default: () => {
      const now = new Date()
      const currentDay = now.getDate()
      const period = currentDay <= 15 ? '1' : '2'
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${period}`
    }
  }
})

// Current date for reference
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1
const currentDay = today.getDate()
const currentPeriod = currentDay <= 15 ? 1 : 2

// Selected date state
const selectedYear = ref(currentYear)
const selectedMonth = ref(currentMonth)
const selectedPeriod = ref(currentPeriod)

// Year and month options
const yearOptions = computed(() => {
  const years = []
  for (let year = currentYear - 2; year <= currentYear + 1; year++) {
    years.push({ label: year.toString(), value: year })
  }
  return years
})

const monthOptions = computed(() => [
  { label: t('months.january'), value: 1 },
  { label: t('months.february'), value: 2 },
  { label: t('months.march'), value: 3 },
  { label: t('months.april'), value: 4 },
  { label: t('months.may'), value: 5 },
  { label: t('months.june'), value: 6 },
  { label: t('months.july'), value: 7 },
  { label: t('months.august'), value: 8 },
  { label: t('months.september'), value: 9 },
  { label: t('months.october'), value: 10 },
  { label: t('months.november'), value: 11 },
  { label: t('months.december'), value: 12 }
])


// Computed formatted date with period
const formattedDate = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value.toString().padStart(2, '0')
  const period = selectedPeriod.value
  return `${year}-${month}-${period}`
})

const selectedMonthName = computed(() => {
  const monthObj = monthOptions.value.find(m => m.value === selectedMonth.value)
  return monthObj ? monthObj.label : t('unknown')
})

// Period description for display (shows actual days for the selected month)
const selectedPeriodDescription = computed(() => {
  if (selectedPeriod.value === 1) {
    return '1-15'
  } else {
    const lastDayOfMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
    return `16-${lastDayOfMonth}`
  }
})

// Check if current period is selected
const isCurrentPeriod = computed(() =>
  selectedYear.value === currentYear &&
  selectedMonth.value === currentMonth &&
  selectedPeriod.value === currentPeriod
)

// Quick date functions
function setToday() {
  selectedYear.value = currentYear
  selectedMonth.value = currentMonth
  selectedPeriod.value = currentPeriod
  emitDateChange()
}

function setLastPeriod() {
  let year = selectedYear.value
  let month = selectedMonth.value
  let period = selectedPeriod.value - 1

  if (period === 0) {
    period = 2
    month = month - 1

    if (month === 0) {
      month = 12
      year = year - 1
    }
  }

  selectedYear.value = year
  selectedMonth.value = month
  selectedPeriod.value = period
  emitDateChange()
}

function setNextPeriod() {
  let year = selectedYear.value
  let month = selectedMonth.value
  let period = selectedPeriod.value + 1

  if (period === 3) {
    period = 1
    month = month + 1

    if (month === 13) {
      month = 1
      year = year + 1
    }
  }

  selectedYear.value = year
  selectedMonth.value = month
  selectedPeriod.value = period
  emitDateChange()
}

function emitDateChange() {
  emit('date-changed', formattedDate.value)
}

// Watch for changes and emit
function onYearChange() {
  emitDateChange()
}

function onMonthChange() {
  emitDateChange()
}

// Initialize from prop
onMounted(() => {
  if (props.modelValue) {
    const parts = props.modelValue.split('-')
    if (parts.length === 3) {
      // New format: YYYY-MM-P (P = period: 1 or 2)
      selectedYear.value = parseInt(parts[0])
      selectedMonth.value = parseInt(parts[1])
      selectedPeriod.value = parseInt(parts[2]) || 1
    } else if (parts.length === 2) {
      // Old format: YYYY-MM (convert to current period)
      selectedYear.value = parseInt(parts[0])
      selectedMonth.value = parseInt(parts[1])
      selectedPeriod.value = currentPeriod
    }
  } else {
    // If no modelValue provided, ensure current period is selected
    selectedYear.value = currentYear
    selectedMonth.value = currentMonth
    selectedPeriod.value = currentPeriod
  }

  // Always emit the initial date change
  emitDateChange()
})
</script>

<template>
  <div class="date-filter-container q-pa-sm shadow-1 q-mb-md">
    <div class="row q-col-gutter-md items-center">
      <!-- Current Selection -->
      <div class="col-12 col-md-4">
        <div class="flex items-center justify-center justify-md-start">
          <q-icon name="calendar_today" class="q-mr-sm text-primary" size="sm" />
          <span class="text-subtitle1 text-weight-medium">
            {{ selectedMonthName }} {{ selectedYear }}
          </span>
          <q-chip
            size="sm"
            :color="selectedPeriod === 1 ? 'blue' : 'positive'"
            text-color="white"
            class="q-ml-sm"
          >
            {{ selectedPeriod === 1 ? '1-15' : `16-${selectedPeriodDescription.split('-')[1]}` }}
          </q-chip>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="col-12 col-md-8">
        <div class="flex q-gutter-sm items-center justify-center justify-md-end">
          <q-btn-group flat>
            <q-btn
              @click="setLastPeriod"
              flat
              dense
              icon="chevron_left"
              class="text-grey-6"
            />
            <q-btn
              @click="setToday"
              flat
              dense
              no-caps
              :class="isCurrentPeriod ? 'text-positive' : 'text-grey'"
            >
              {{ $t('dateFilter.thisPeriod') }}
            </q-btn>
            <q-btn
              @click="setNextPeriod"
              flat
              dense
              icon="chevron_right"
              class="text-grey-6"
            />
          </q-btn-group>
          <q-select
            v-model="selectedYear"
            :options="yearOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            dense
            style="width: 90px"
            @update:model-value="onYearChange"
          />
          <q-select
            v-model="selectedMonth"
            :options="monthOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            dense
            style="width: 120px"
            @update:model-value="onMonthChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-filter-container {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
