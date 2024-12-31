<script setup>
import { useQuasar } from "quasar";
import { computed, onMounted, ref } from "vue";
import { useBudget } from 'src/stores/budget.js'

const $q = useQuasar();
const budget = useBudget();

const loading = ref(false);
const showConvertModal = ref(false);
const showAddModal = ref(false);
const selectedData = ref({
  from: {
    label: "USD",
    value: '/api/budgets/2'
  },
  to: {
    label: "SO'M",
    value: '/api/budgets/1'
  }
});
const addQuantity = ref(0);
const budgets = ref([]);

function getBudgets (){
  loading.value = true;
  budget.fetchBudgets('?page=1')
    .then((res) => {
      budgets.value = res.data['hydra:member'];
    })
    .finally(() => {
      loading.value = false;
    });
}
function updateSelectedData(property) {
  const oppositeProperty = property === 'from' ? 'to' : 'from';
  selectedData.value[property] = budgetOptions.value.filter(option => option.value !== selectedData.value[oppositeProperty].value)[0];
}
function convertAction() {
  loading.value = true;

  const input = {
    fromBudget: {
      budget: selectedData.value.from.value,
      quantity: selectedData.value.fromQuantity,
      description: `${selectedData.value.from.label} hisobdan dan ${selectedData.value.from.to} hisobga ${selectedData.value.fromQuantity} ayriboshlash uchun yuborildi`,
      isIncome: false
    },
    toBudget: {
      budget: selectedData.value.to.value,
      quantity: selectedData.value.toQuantity,
      description: `${selectedData.value.from.label} hisobdan dan ${selectedData.value.from.to} hisobga ${selectedData.value.fromQuantity} ayriboshlash orqali mablag' kiritildi`,
      isIncome: true
    }
  }

  budget.convert(input)
    .then(() => {
      showConvertModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: "Convert is done successfully!"
      });
      getBudgets();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: "Error while converting"
      })
    })
    .finally(() => {
      loading.value = false;
    })
}
function addAction() {
  loading.value = true;

  const input = {
    budget: selectedData.value['@id'],
    quantity: addQuantity.value,
    description: 'Hisobga admin orqali pul qo\'shildi',
    isIncome: true
  }

  budget.add(input)
    .then(() => {
      addQuantity.value = 0;
      showAddModal.value = false;
      $q.notify({
        type: 'positive',
        position: 'top',
        timeout: 1000,
        message: "Add is done successfully!"
      });
      getBudgets();
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        position: 'top',
        timeout: 1000,
        message: "Error while adding"
      })
    })
    .finally(() => {
      loading.value = false;
    })
}

const budgetOptions = computed(() => {
  let options = [];
  for ( let i in budgets.value ) {
    options.push( {
      label: budgets.value[i].name,
      value: budgets.value[i]['@id']
    } );
  }
  return options
})

onMounted(() => {
  getBudgets();
})
</script>

<template>
  <section class="q-pa-md">
    <div class="q-pa-md q-mb-md shadow-3 text-center">
      <q-btn
        icon-right="mdi-swap-horizontal"
        :label="$t('convert')"
        size="md"
        color="green"
        no-caps
        @click="showConvertModal = true"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="budget in budgets"
        :key="budget.id"
        class="col-xs-12 col-sm-6 col-lg-4 col-xl-3"
      >
        <q-card>
          <div class="flex justify-between items-center bg-primary text-white text-weight-medium q-pa-sm">
            <div>
              {{ budget.name }} {{ $t('balance') }}
            </div>
            <div>
              <q-btn icon="mdi-cash-plus" round text-color="green" color="white" @click="showAddModal = true; selectedData = budget" />
            </div>
          </div>
          <q-separator />
          <div class="flex justify-center q-mt-md">
            <span class="bg-grey-2 q-pa-sm rounded">
              <q-icon name="mdi-bank-outline" color="primary" size="xl" />
            </span>
          </div>
          <div class="flex justify-center text-weight-medium q-mb-md">
            {{ budget.name }}
          </div>
          <q-separator />
          <div class="q-pa-sm text-green text-weight-bolder">
            <div> {{ $t('quantity') }}: {{ budget.quantity }} {{ budget.currency.symbol }} ({{ budget.currency.name }}) </div>
          </div>
        </q-card>
      </div>
    </div>
  </section>

  <!-- Dialogs -->
  <q-dialog v-model="showConvertModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="convertAction">
        <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
          <div class="text-h6"> {{ $t('convert') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>

        <div class="row q-px-md q-col-gutter-x-lg q-mb-lg">
          <q-select
            v-model="selectedData.from"
            :options="budgetOptions"
            :label="$t('balance') + ' ' + $t('from')"
            name="budget"
            class="col-6"
            @update:model-value="() => updateSelectedData('to')"
          />
          <q-input
            type="number"
            v-model.number="selectedData.fromQuantity"
            :prefix="selectedData?.from?.label === 'USD' ? '$' : 'U'"
            :label="$t('quantity')"
            lazy-rules
            :rules="[ val => val && val > 0 || '' ]"
            class="col-6"
          />

          <q-select
            v-model="selectedData.to"
            :options="budgetOptions"
            :label="$t('balance') + ' ' + $t('to')"
            name="budget"
            class="col-6"
            @update:model-value="() => updateSelectedData('from')"
          />
          <q-input
            type="number"
            v-model.number="selectedData.toQuantity"
            :prefix="selectedData?.from?.label === 'USD' ? 'U' : '$'"
            :label="$t('quantity')"
            lazy-rules
            :rules="[ val => val && val > 0 || '' ]"
            class="col-6"
          />
        </div>

        <q-separator />

        <div class="q-px-md q-py-sm text-center">
          <q-btn :label="$t('convert')" type="submit" color="primary" icon-right="mdi-briefcase-arrow-up-down" />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showAddModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="addAction">
        <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
          <div class="text-h6"> {{ $t('add') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="addQuantity = 0" />
        </div>

        <div class="row q-px-md q-col-gutter-x-lg q-mb-lg">
          <q-input
            type="number"
            v-model.number="addQuantity"
            :label="$t('quantity')"
            lazy-rules
            :rules="[ val => val && val > 0 || '' ]"
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn :label="$t('add')" type="submit" color="primary" icon-right="mdi-cash-plus" />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<style scoped>
.rounded {
  border-radius: 100%;
}
</style>
