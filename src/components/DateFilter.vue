<script setup>
import { ref, computed, onMounted } from 'vue'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['date-changed'])

const props = defineProps({
  modelValue: {
    type: String,
    default: () => date.formatDate(Date.now(), 'YYYY-MM')
  }
})

// Current date for reference
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1

// Selected date state
const selectedYear = ref(currentYear)
const selectedMonth = ref(currentMonth)

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

// Computed formatted date
const formattedDate = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value.toString().padStart(2, '0')
  return `${year}-${month}`
})

const selectedMonthName = computed(() => {
  const monthObj = monthOptions.value.find(m => m.value === selectedMonth.value)
  return monthObj ? monthObj.label : t('unknown')
})

// Quick date functions
function setToday() {
  selectedYear.value = currentYear
  selectedMonth.value = currentMonth
  emitDateChange()
}

function setLastMonth() {
  let year = currentYear
  let month = currentMonth - 1
  
  if (month === 0) {
    month = 12
    year = currentYear - 1
  }
  
  selectedYear.value = year
  selectedMonth.value = month
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
    const [year, month] = props.modelValue.split('-')
    selectedYear.value = parseInt(year)
    selectedMonth.value = parseInt(month)
  }
})
</script>

<template>
  <div class="date-filter-container bg-white q-pa-md shadow-2 sticky">
    <div class="row items-center q-col-gutter-md">
      <!-- Current Selection Display -->
      <div class="col-12 col-md-3">
        <div class="selected-date-display">
          <q-icon name="calendar_today" class="q-mr-sm text-primary" />
          <span class="text-h6 text-weight-medium text-primary">
            {{ selectedMonthName }} {{ selectedYear }}
          </span>
          <q-chip 
            size="sm" 
            color="primary" 
            text-color="white" 
            class="q-ml-sm"
            icon="schedule"
          >
            {{ $t('dateFilter.selectedPeriod') }}
          </q-chip>
        </div>
      </div>

      <!-- Quick Shortcuts -->
      <div class="col-12 col-md-5">
        <div class="row q-gutter-sm">
          <q-btn 
            @click="setToday"
            :color="selectedYear === currentYear && selectedMonth === currentMonth ? 'positive' : 'grey-5'"
            :text-color="selectedYear === currentYear && selectedMonth === currentMonth ? 'white' : 'grey-8'"
            size="sm"
            rounded
            no-caps
          >
            <q-icon name="today" class="q-mr-xs" />
            {{ $t('dateFilter.thisMonth') }}
          </q-btn>
          <q-btn 
            @click="setLastMonth"
            color="grey-5"
            text-color="grey-8"
            size="sm"
            rounded
            no-caps
          >
            <q-icon name="arrow_back" class="q-mr-xs" />
            {{ $t('dateFilter.lastMonth') }}
          </q-btn>
        </div>
      </div>

      <!-- Date Selectors -->
      <div class="col-12 col-md-4">
        <div class="row q-gutter-sm">
          <div class="col">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              :label="$t('dateFilter.year')"
              @update:model-value="onYearChange"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-select>
          </div>
          <div class="col">
            <q-select
              v-model="selectedMonth"
              :options="monthOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              :label="$t('dateFilter.month')"
              @update:model-value="onMonthChange"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_month" />
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-filter-container {
  border-radius: 12px;
  border: 1px solid rgba(33, 150, 243, 0.2);
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.selected-date-display {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border-left: 3px solid #2196f3;
}

/* Dark mode support */
.body--dark .date-filter-container {
  background: rgba(30, 30, 30, 0.95) !important;
  border-color: rgba(33, 150, 243, 0.3);
}

.body--dark .selected-date-display {
  background: rgba(33, 150, 243, 0.2);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .date-filter-container {
    position: relative;
    top: auto;
    margin-bottom: 16px;
  }
  
  .selected-date-display {
    justify-content: center;
    margin-bottom: 12px;
  }
}

/* Animation for smooth transitions */
.date-filter-container {
  transition: all 0.3s ease;
}

.selected-date-display {
  transition: all 0.2s ease;
}
</style>
