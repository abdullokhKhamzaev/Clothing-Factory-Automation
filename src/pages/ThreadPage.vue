<script setup>
import {computed, onMounted, ref} from "vue";
import { useThread } from "stores/thread.js";
import { useThreadPurchase } from "stores/threadPurchase.js";
import { useBudget } from "stores/budget.js";
import { useAbout } from "stores/user/about.js";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";

const { t } = useI18n();
const $q = useQuasar();
const thread = useThread();
const budget = useBudget();
const user = useAbout();
const threads = ref([]);
const budgets = ref([]);
const users = ref([]);
const showPurchaseModal = ref(false);

const selectedData = ref({});
const threadLoading = ref(false);
const budgetLoading = ref(false);
const columns = [
  { name: 'name', label: t('tables.thread.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.thread.columns.quantity'), align: 'left', field: 'quantity' }
];

function aboutMe () {
  budgetLoading.value = true;
  user.fetchAbout('?page=1')
    .then((res) => {
      users.value = res.data;
    })
    .finally(() => {
      budgetLoading.value = false;
    });
}
function getThreads () {
  threadLoading.value =  true;
  thread.fetchThreads('?page=1')
    .then((res) => {
      threads.value = res.data['hydra:member'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}
function getBudgets (){
  budgetLoading.value = true;
  budget.fetchBudgets('?page=1')
    .then((res) => {
      budgets.value = res.data['hydra:member'];
    })
    .finally(() => {
      budgetLoading.value = false;
    });
}
function clearAction() {
  selectedData.value = {};
}
function createAction () {
  if (users?.value['@id']) {
    let input = {
      thread: selectedData.value.thread,
      quantity: selectedData.value.quantity,
      price: selectedData.value.price,
      currency: selectedData.value.budget.currency['@id'],
      paidPrice: selectedData.value.paidPrice,
      purchasedBy: users.value['@id'],
      transaction: {
        paidPrice: selectedData.value.paidPrice,
        createdBy: users.value['@id'],
        isIncome: false,
        currency: selectedData.value.budget.currency['@id'],
        description: 'Ip sotib olish',
        budget: selectedData.value.budget['@id'],
        isOldInAndOut: false,
        price: String(selectedData.value.quantity * selectedData.value.price)
      }
    }

    useThreadPurchase().createPurchase(input)
      .then(() => {
        showPurchaseModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.threadPurchase.confirmation.successBought')
        })
        clearAction();
        getThreads();
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.threadPurchase.confirmation.failure')
        })
      })
      .finally(() => {
        threadLoading.value = false;
      })
  } else {
    console.warn('user not found');
  }
}

const budgetOptions = computed(() => {
  let options = [];
  for ( let i in budgets.value ) {
    options.push( {
      label: budgets.value[i].name,
      value: budgets.value[i]
    } );
  }
  return options
})

const threadOptions = computed(() => {
  let options = [];
  for ( let i in threads.value ) {
    options.push( {
      label: threads.value[i].name,
      value: threads.value[i]['@id']
    } );
  }
  return options
})

onMounted(() => {
  aboutMe();
  getThreads();
  getBudgets();
});
</script>

<template>
  <div class="q-mx-md q-mt-md">
    <q-btn no-caps label="Ip xarid qilish" color="primary" class="q-mb-md" @click="showPurchaseModal = true" />
    <q-table
      flat
      bordered
      :rows="threads"
      :columns="columns"
      :no-data-label="$t('tables.thread.header.empty')"
      :loading="threadLoading"
      color="primary"
      row-key="id"
      hide-bottom
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:top>
        <div class="col-12">
          <div class="q-table__title">{{ $t('tables.thread.header.title') }}</div>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            <div
              v-if="col.name === 'quantity'"
              class="flex q-gutter-sm"
            >
              <span> {{ props.row.quantity }} </span>
              <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
            </div>

            <div v-else>
              {{ props.row[col.field] || '-' }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="showPurchaseModal" persistent>
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div class="bg-primary q-px-md q-py-sm text-white flex justify-between q-mb-lg">
          <div class="text-h6"> {{ $t('dialogs.threadPurchase.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup @click="clearAction" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-select
            v-model="selectedData.thread"
            filled
            emit-value
            map-options
            :loading="budgetLoading"
            :options="threadOptions"
            :label="$t('forms.threadPurchase.fields.thread.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.threadPurchase.fields.thread.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.quantity"
            type="number"
            filled
            :disable="!selectedData.thread"
            :label="$t('forms.threadPurchase.fields.quantity.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.threadPurchase.fields.quantity.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
          <q-select
            v-model="selectedData.budget"
            filled
            emit-value
            map-options
            :loading="budgetLoading"
            :options="budgetOptions"
            :label="$t('forms.threadPurchase.fields.budget.label')"
            option-value="value"
            option-label="label"
            :rules="[val => !!val || $t('forms.threadPurchase.fields.budget.validation.required')]"
            class="col-6"
            hide-bottom-space
          />
          <q-input
            v-model="selectedData.price"
            type="number"
            filled
            :disable="!selectedData.budget || !selectedData.thread || !selectedData.quantity > 0"
            :prefix="selectedData?.budget === '/api/budgets/1' ? 'so\'m:' : '$:'"
            :label="$t('forms.threadPurchase.fields.price.label')"
            lazy-rules
            :rules="[ val => val && val > 0 || $t('forms.threadPurchase.fields.price.validation.required')]"
            hide-bottom-space
            class="col-6"
          />
          <q-input
            v-model="selectedData.paidPrice"
            type="number"
            filled
            :disable="!selectedData.price || !selectedData.budget || !selectedData.thread || !selectedData.quantity > 0"
            :prefix="selectedData?.budget === '/api/budgets/1' ? `${selectedData.quantity * selectedData.price} so'm ${$t('from')}` : `${selectedData.quantity * selectedData.price} $ ${$t('from')}`"
            :label="$t('forms.threadPurchase.fields.paidPrice.label')"
            lazy-rules
            :rules="[ val => val && val > -1 || $t('forms.threadPurchase.fields.paidPrice.validation.required')]"
            hide-bottom-space
            class="col-12"
          />
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn no-caps :label="$t('forms.threadPurchase.buttons.buy')" type="submit" color="primary"/>
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
