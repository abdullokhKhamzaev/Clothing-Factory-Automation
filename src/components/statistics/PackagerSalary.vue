<script setup>
import {computed, onMounted, ref, watch} from "vue"
// import RefreshButton from "components/RefreshButton.vue";
import { useProductWarehouse } from "stores/productInWarehouseAction.js";
import { useWorkEntries } from "stores/workEntries.js";
import {formatFloatToInteger} from "../../libraries/constants/defaults.js";
import {useAbout} from "stores/user/about.js";

const user = useAbout();

const props = defineProps({
  date: {
    type: String,
    required: true,
  }
})

// const splitterModel = ref(50);

// Accepted Orders
const models = ref([]);
const loading = ref(false);
const embroideryWarehouse = '/api/warehouses/3';
const embroideryReadyWarehouse = ref('/api/warehouses/4');
async function getModels () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  let filterProps = {};

  filterProps.fromWarehouse = embroideryWarehouse;
  filterProps.toWarehouse = embroideryReadyWarehouse;
  filterProps.date = props.date;
  filterProps.status = 'accepted';
  filterProps.rowsPerPage = '~';
  filterProps.sentBy = '/api/users/1';

  await useProductWarehouse().list(filterProps || '')
    .then((res) => {
      models.value = res.data['hydra:member'];
    })
    .finally(() => {
      loading.value = false;
    });
}

// Services
const services = ref([]);
const serviceLoading = ref(false);
async function getServices () {
  if (serviceLoading.value) return; // Prevent multiple rapid calls
  serviceLoading.value = true;

  let filterProps = {};

  filterProps.workerBy = user.about.id;
  filterProps.date = props.date;
  filterProps.status = 'accepted';
  // filterProps.sentBy = '/api/users/13';
  filterProps.rowsPerPage = '~';

  await useWorkEntries().list(filterProps || '')
    .then((res) => {
      services.value = res.data['hydra:member'];
    })
    .finally(() => {
      serviceLoading.value = false;
    });
}

watch(props, () => {
  // getModels();
  getServices();
}, {deep: true})

onMounted(() => {
  user.fetchAbout().then(() => {
    getModels();
    getServices();
  });
})
// const totalQuantity = computed(() => {
//   return models.value.reduce((total, model) => {
//     return total + model.productSize.reduce((sum, item) => sum + item.quantity, 0)
//   }, 0)
// })

const totalQuantity2 = computed(() => {
  return services.value.reduce((sum, item) => sum + Number(item.totalPrice), 0)
})
</script>

<template>
  {{ formatFloatToInteger(totalQuantity2) }}

<!--  <q-card flat bordered class="q-pa-sm text-green q-mb-md">-->
<!--    <q-card-section class="flex justify-between">-->
<!--      <div class="text-h6 text-primary">Tasdiqni kutayotgan mahsulotlar:</div>-->
<!--      <refresh-button dense :action="getModels" />-->
<!--    </q-card-section>-->

<!--    <q-linear-progress v-if="loading" indeterminate color="primary" />-->
<!--    <q-separator v-else />-->

<!--    <q-expansion-item-->
<!--      expand-separator-->
<!--      label="Qo'shimcha ma'lumotlar"-->
<!--      header-class="text-primary"-->
<!--    >-->
<!--      <q-card>-->
<!--        <div v-for="model in models" :key="model.id">-->
<!--          <q-splitter v-model="splitterModel">-->
<!--            <template v-slot:before>-->
<!--              <q-card-section>{{ model.productModel.name }}</q-card-section>-->
<!--            </template>-->

<!--            <template v-slot:after>-->
<!--              <q-card-section><pre>-->
<!--                {{ model.productSize.reduce((sum, item) => sum + item.quantity, 0) }}-->
<!--                {{ model.createdAt }}-->
<!--              </pre></q-card-section>-->
<!--            </template>-->
<!--          </q-splitter>-->
<!--          <q-separator inset />-->
<!--        </div>-->
<!--      </q-card>-->
<!--    </q-expansion-item>-->

<!--    <q-card-section>-->
<!--      <div class="text-bold">Jami: {{ totalQuantity }}</div>-->
<!--    </q-card-section>-->
<!--  </q-card>-->
</template>
