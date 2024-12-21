<script setup>
import {onMounted, ref} from "vue";
import { useBudget } from 'src/stores/budget.js'

const isLoading = ref(false)
const budgets = ref([])
const budget = useBudget();

onMounted(() => {
  isLoading.value = true;
  budget.fetchBudgets('?page=1')
    .then((res) => {
      budgets.value = res.data['hydra:member'];
    })
    .finally(() => {
      isLoading.value = false;
    })
})
</script>

<template>
  <section class="q-pa-md">
    <div class="row q-pa-md q-mb-md shadow-3">
      <div class="col-6">
        <q-btn label="Yangi hisob" color="primary" />
      </div>
      <div class="col-6 text-h6 text-weight-bolder flex">
        Umumiy balans: <div class="no-wrap q-pl-sm">10 780 USD</div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="budget in budgets"
        :key="budget.id"
        class="col-xs-12 col-sm-6 col-lg-4 col-xl-3"
      >
        <q-card class="q-pa-xs">
          <div class="flex justify-between">
            <q-icon name="edit_square" color="primary" size="md" />
            <q-icon name="delete" color="primary" size="md" />
          </div>
          <div class="flex justify-center q-mt-md">
        <span class="bg-blue-2 q-pa-sm rounded">
          <q-icon name="account_balance" color="primary" size="xl" />
        </span>
          </div>
          <div class="flex justify-center text-weight-medium q-mb-md">
            {{ budget.name }}
          </div>
          <q-separator />
          <div class="q-pa-sm">
            <div> Balans: {{ budget.quantity }} {{ budget.currency.name }} ({{ budget.currency.shortName }}) </div>
          </div>
        </q-card>
      </div>
    </div>
  </section>

<!--  </div>-->
</template>

<style scoped>
.rounded {
  border-radius: 100%;
}
</style>
