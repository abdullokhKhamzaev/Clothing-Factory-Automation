<script setup>
import {computed, ref} from "vue"
import RefreshButton from "components/RefreshButton.vue"
import {formatDate, formatFloatToInteger, isToday} from "../../libraries/constants/defaults.js"
import {useI18n} from "vue-i18n"
import {useQuasar} from "quasar"

const { t } = useI18n()
const $q = useQuasar()

// Ma'lumotni parent beradi (oy bo'yicha bitta so'rov) — bu komponent o'zi
// hech narsa fetch qilmaydi, faqat tanlangan davr yozuvlarini chizadi
const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const columns = [
  { name: 'createdAt', label: t('tables.workEntry.columns.createdAt'), align: 'left', field: 'createdAt' },
  { name: 'workerBy', label: t('tables.workEntry.columns.workerBy'), align: 'left', field: 'workerBy' },
  { name: 'productAccessory', label: t('tables.workEntry.columns.productAccessory'), align: 'left', field: 'productAccessory' },
  { name: 'embroidery', label: t('tables.workEntry.columns.embroidery'), align: 'left', field: 'embroidery' },
  { name: 'quantityPrice', label: t('quantityAndPrice'), align: 'left', field: 'quantityPrice' },
  { name: 'confirmedBy', label: t('tables.workEntry.columns.confirmedBy'), align: 'left', field: 'confirmedBy' },
]

const visibleColumns = ref(columns.map(column => column.name))
const isMobile = computed(() => $q.screen.lt.md)

// Client-side sahifalash: bir sahifada 10 ta qator chiziladi (DOM yengil qoladi)
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'createdAt',
  descending: true
})
const mobilePage = ref(1)
const mobileRowsPerPage = 10

const sortedEntries = computed(() => {
  return [...props.entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const mobileEntries = computed(() => {
  const start = (mobilePage.value - 1) * mobileRowsPerPage
  return sortedEntries.value.slice(start, start + mobileRowsPerPage)
})

const mobilePagesCount = computed(() => Math.max(1, Math.ceil(sortedEntries.value.length / mobileRowsPerPage)))

// Davr jami — sahifa emas, BUTUN tanlangan davr bo'yicha
const totalQuantity = computed(() => {
  return props.entries.reduce((sum, item) => sum + Number(item.totalPrice), 0)
})

function modelName(row) {
  return row.productModel?.name || row.productAccessory?.productSize?.productModel?.name || '-'
}

function refresh() {
  emit('refresh')
}
</script>

<template>
  <q-card class="table-card">
    <q-card-section class="q-pa-none">
      <!-- Mobil: karta ko'rinishi (ishchilar asosan telefondan kiradi) -->
      <div v-if="isMobile" class="q-pa-md">
        <div class="flex justify-between items-center q-mb-md">
          <div class="text-subtitle1 text-primary text-weight-bold">
            <q-icon name="work" class="q-mr-xs" />
            {{ $t('tables.workEntry.header.title') }}
          </div>
          <refresh-button :action="refresh" color="primary" />
        </div>

        <div v-if="!sortedEntries.length && !props.loading" class="text-center text-grey q-pa-md">
          {{ $t('tables.workEntry.header.empty') }}
        </div>

        <q-list v-else bordered separator class="rounded-borders">
          <q-item
            v-for="row in mobileEntries"
            :key="row.id"
            :class="isToday(row.createdAt) ? 'today-row' : ''"
          >
            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ modelName(row) }}
              </q-item-label>
              <q-item-label v-if="row.embroidery?.name" caption>
                <q-icon name="design_services" size="xs" class="text-purple q-mr-xs" />{{ row.embroidery.name }}
              </q-item-label>
              <q-item-label class="q-mt-xs">
                <q-badge color="positive" :label="formatFloatToInteger(row.quantity)" />
                <span class="text-caption text-grey-7 q-ml-xs">{{ $t('piece').toLowerCase() }}</span>
                <q-icon name="close" size="xs" class="text-grey-5 q-mx-xs" />
                <span>{{ formatFloatToInteger(row.unitPrice) }}</span>
                <q-icon name="arrow_forward" size="xs" class="text-grey-5 q-mx-xs" />
                <span class="text-weight-bold text-primary">{{ formatFloatToInteger(row.totalPrice) }} {{ row.budget?.name }}</span>
              </q-item-label>
              <q-item-label caption class="q-mt-xs flex justify-between">
                <span>{{ formatDate(row.createdAt) }}</span>
                <span><q-icon name="check" size="xs" class="text-positive" /> {{ row.confirmedBy?.fullName }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="mobilePagesCount > 1" class="flex justify-center q-mt-md">
          <q-pagination
            v-model="mobilePage"
            :max="mobilePagesCount"
            :max-pages="5"
            direction-links
          />
        </div>
      </div>

      <!-- Desktop: jadval (client-side sahifalash — qo'shimcha so'rov yo'q) -->
      <q-table
        v-else
        flat
        class="salary-table"
        :no-data-label="$t('tables.workEntry.header.empty')"
        :columns="columns"
        :visible-columns="visibleColumns"
        :rows="sortedEntries"
        row-key="id"
        v-model:pagination="pagination"
        :rows-per-page-options="[10, 25, 50, 100, 0]"
        :loading="props.loading"
      >
        <template v-slot:top>
          <div class="col-12 q-gutter-y-sm" :class="$q.screen.lt.sm ? '' : 'flex'">
            <div class="q-table__title text-primary">
              <q-icon name="work" class="q-mr-sm" />
              {{ $t('tables.workEntry.header.title') }}
            </div>

            <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
              <refresh-button :action="refresh" color="primary" class="q-mb-md q-mb-sm-none" />
              <q-select
                dense
                multiple
                outlined
                options-dense
                emit-value
                map-options
                v-model="visibleColumns"
                :display-value="$q.lang.table.columns"
                :options="columns"
                option-value="name"
                :label="$t('columns')"
                class="w-full"
              />
            </div>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" :class="isToday(props.row.createdAt) ? 'today-row' : ''">
            <q-td v-for="col in columns" :key="col.name" :props="props">
              <!-- Date Column -->
              <div v-if="col.name === 'createdAt'" class="date-cell">
                <q-icon name="event" class="q-mr-xs text-primary" size="sm" />
                <span>{{ formatDate(props.row.createdAt) }}</span>
                <q-chip v-if="isToday(props.row.createdAt)" size="sm" color="green" text-color="white" class="q-ml-sm">
                  {{ $t('today') }}
                </q-chip>
              </div>

              <!-- Worker Column -->
              <div v-else-if="col.name === 'workerBy'" class="worker-cell">
                <q-avatar size="sm" color="primary" text-color="white" class="q-mr-sm">
                  {{ props.row.workerBy.fullName.charAt(0) }}
                </q-avatar>
                <span>{{ props.row.workerBy.fullName }}</span>
              </div>

              <!-- Product Column -->
              <div v-else-if="col.name === 'productAccessory'" class="product-cell">
                <q-icon name="inventory_2" class="q-mr-xs text-orange" size="sm" />
                <span>{{ modelName(props.row) }}</span>
              </div>

              <!-- Embroidery Column -->
              <div v-else-if="col.name === 'embroidery'" class="embroidery-cell">
                <q-icon name="design_services" class="q-mr-xs text-purple" size="sm" />
                <span>{{ props.row.embroidery?.name || '-' }}</span>
              </div>

              <!-- Combined Quantity and Price Column -->
              <div v-else-if="col.name === 'quantityPrice'" class="quantity-price-cell">
                <div class="row items-center q-gutter-sm">
                  <div class="col-auto">
                    <q-badge color="positive" :label="formatFloatToInteger(props.row.quantity)" />
                    <span class="q-ml-xs text-grey-7 text-caption">{{ $t('piece').toLowerCase() }}</span>
                  </div>
                  <div class="col-auto">
                    <q-icon name="close" size="xs" class="text-grey-5" />
                  </div>
                  <div class="col-auto">
                    <span class="text-weight-medium">{{ formatFloatToInteger(props.row.unitPrice) }}</span>
                    <span class="text-grey-6 text-caption q-ml-xs">{{ props.row.budget.name }}</span>
                  </div>
                  <div class="col-auto">
                    <q-icon name="arrow_forward" size="xs" class="text-grey-5" />
                  </div>
                  <div class="col-auto">
                    <div class="text-weight-bold text-primary">
                      {{ formatFloatToInteger(props.row.totalPrice) }} {{ props.row.budget.name }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Confirmed By Column -->
              <div v-else-if="col.name === 'confirmedBy'" class="confirmed-cell">
                <q-avatar size="sm" color="positive" text-color="white" class="q-mr-sm">
                  <q-icon name="check" size="xs" />
                </q-avatar>
                <span>{{ props.row.confirmedBy.fullName }}</span>
              </div>

              <!-- Default -->
              <div v-else>
                {{ props.row[col.field] }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="full-width q-pa-md">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-primary text-weight-bold">
              {{ $t('total') }}: {{ formatFloatToInteger(totalQuantity) }} SO'M
            </div>
          </div>
          <div class="col-auto">
            <q-chip color="primary" text-color="white" size="md">
              <q-icon name="payments" class="q-mr-xs" />
              {{ $t('totalPayment') }}
            </q-chip>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.table-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.salary-table {
  border-radius: 0;
}

.today-row {
  border-left: 4px solid #4caf50;
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.today-row:hover {
  background-color: rgba(76, 175, 80, 0.15) !important;
}

.date-cell {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.worker-cell {
  display: flex;
  align-items: center;
}

.product-cell {
  display: flex;
  align-items: center;
}

.embroidery-cell {
  display: flex;
  align-items: center;
}

.quantity-price-cell {
  min-width: 280px;
}

.confirmed-cell {
  display: flex;
  align-items: center;
}

/* Table enhancements */
.q-table th {
  background-color: var(--q-dark-page, #fafafa);
  font-weight: 600;
  color: #2196f3;
}

.q-table tbody tr:hover {
  background-color: rgba(33, 150, 243, 0.05);
}

/* Loading animation */
.q-table--loading .q-table__bottom,
.q-table--loading .q-table__top {
  opacity: 0.6;
}
</style>
