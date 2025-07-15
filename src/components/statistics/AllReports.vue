<script setup>
import {ref} from "vue"
import {useI18n} from "vue-i18n";
import CutModelsAccepted from "components/statistics/CutModelsAccepted.vue";
import CutModelsPending from "components/statistics/CutModelsPending.vue";
import CutModelsDefectAccepted from "components/statistics/CutModelsDefectAccepted.vue";
import CutModelsDefectPending from "components/statistics/CutModelsDefectPending.vue";
import EmbroideryModelsAccepted from "components/statistics/EmbroideryModelsAccepted.vue";
import EmbroideryModelsPending from "components/statistics/EmbroideryModelsPending.vue";
import EmbroideryModelsCutDefectPending from "components/statistics/EmbroideryModelsCutDefectPending.vue";
import EmbroideryModelsCutDefectAccepted from "components/statistics/EmbroideryModelsCutDefectAccepted.vue";
import CutModelsEmbroideryAccepted from "components/statistics/CutModelsEmbroideryAccepted.vue";
import CutModelsSewAccepted from "components/statistics/CutModelsSewAccepted.vue";
import CutModelsEmbroideryPending from "components/statistics/CutModelsEmbroideryPending.vue";
import CutModelsSewPending from "components/statistics/CutModelsSewPending.vue";
import EmbroideryModelsSewAccepted from "components/statistics/EmbroideryModelsSewAccepted.vue";
import EmbroideryModelsSewPending from "components/statistics/EmbroideryModelsSewPending.vue";
import SewModelsAccepted from "components/statistics/SewModelsAccepted.vue";
import SewModelsPending from "components/statistics/SewModelsPending.vue";
import SewReadyModelsAccepted from "components/statistics/SewReadyModelsAccepted.vue";
import SewReadyModelsPending from "components/statistics/SewReadyModelsPending.vue";
import SewModelsCutDefectAccepted from "components/statistics/SewModelsCutDefectAccepted.vue";
import SewModelsCutDefectPending from "components/statistics/SewModelsCutDefectPending.vue";
import SewModelsPackageAccepted from "components/statistics/SewModelsPackageAccepted.vue";
import SewModelsPackagePending from "components/statistics/SewModelsPackagePending.vue";
import PackageReadyModelsAccepted from "components/statistics/PackageReadyModelsAccepted.vue";
import PackageReadyModelsPending from "components/statistics/PackageReadyModelsPending.vue";
import PackageModelsCutDefectAccepted from "components/statistics/PackageModelsCutDefectAccepted.vue";
import PackageModelsCutDefectPending from "components/statistics/PackageModelsCutDefectPending.vue";
import PackageModelsAccepted from "components/statistics/PackageModelsAccepted.vue";
import PackageModelsPending from "components/statistics/PackageModelsPending.vue";
import PackageModelsProductWarehouseAccepted from "components/statistics/PackageModelsProductWarehouseAccepted.vue";
import PackageModelsProductWarehousePending from "components/statistics/PackageModelsProductWarehousePending.vue";
import SaleProducts from "components/statistics/SaleProducts.vue";
import ExpensesTransactions from "components/statistics/ExpensesTransactions.vue";

const props = defineProps({
  dateFrom: {
    type: String,
    required: true,
  },
  dateTo: {
    type: String,
    required: true,
  }
})

const step = ref(1);
const splitterModel = ref(50);
const { t } = useI18n();

const cutModelsAcceptedData = ref([])
const cutModelsPendingData = ref([])
const cutModelsDefectAcceptedData = ref([])
const cutModelsDefectPendingData = ref([])
const cutModelsEmbroideryAcceptedData = ref([])
const cutModelsEmbroideryPendingData = ref([])
const cutModelsSewAcceptedData = ref([])
const cutModelsSewPendingData = ref([])
const embroideryModelsAcceptedData = ref([])
const embroideryModelsPendingData = ref([])
const embroideryModelsCutDefectAcceptedData = ref([])
const embroideryModelsCutDefectPendingData = ref([])
const embroideryModelsSewAcceptedData = ref([])
const embroideryModelsSewPendingData = ref([])
const sewModelsAcceptedData = ref([])
const sewModelsPendingData = ref([])
const sewReadyModelsAcceptedData = ref([])
const sewReadyModelsPendingData = ref([])
const sewModelsCutDefectAcceptedData = ref([])
const sewModelsCutDefectPendingData = ref([])
const sewModelsPackageAcceptedData = ref([])
const sewModelsPackagePendingData = ref([])
const packageModelsAcceptedData = ref([])
const packageModelsPendingData = ref([])
const packageReadyModelsAcceptedData = ref([])
const packageReadyModelsPendingData = ref([])
const packageModelsCutDefectAcceptedData = ref([])
const packageModelsCutDefectPendingData = ref([])
const packageModelsProductWarehouseAcceptedData = ref([])
const packageModelsProductWarehousePendingData = ref([])
const saleProductsData = ref([])

function getCutModelsAcceptedData(data) {
  cutModelsAcceptedData.value = data;
}
function getCutModelsPendingData(data) {
  cutModelsPendingData.value = data;
}
function getCutModelsDefectAcceptedData(data) {
  cutModelsDefectAcceptedData.value = data;
}
function getCutModelsDefectPendingData(data) {
  cutModelsDefectPendingData.value = data;
}
function getCutModelsEmbroideryAccepted(data) {
  cutModelsEmbroideryAcceptedData.value = data;
}
function getCutModelsEmbroideryPending(data) {
  cutModelsEmbroideryPendingData.value = data;
}
function getCutModelsSewAccepted(data) {
  cutModelsSewAcceptedData.value = data;
}
function getCutModelsSewPending(data) {
  cutModelsSewPendingData.value = data;
}
function getEmbroideryModelsAcceptedData(data) {
  embroideryModelsAcceptedData.value = data;
}
function getEmbroideryModelsPendingData(data) {
  embroideryModelsPendingData.value = data;
}
function getEmbroideryModelsCutDefectAccepted(data) {
  embroideryModelsCutDefectAcceptedData.value = data;
}
function getEmbroideryModelsCutDefectPending(data) {
  embroideryModelsCutDefectPendingData.value = data;
}
function getEmbroideryModelsSewAccepted(data) {
  embroideryModelsSewAcceptedData.value = data;
}
function getEmbroideryModelsSewPending(data) {
  embroideryModelsSewPendingData.value = data;
}
function getSewModelsAccepted(data) {
  sewModelsAcceptedData.value = data;
}
function getSewModelsPending(data) {
  sewModelsPendingData.value = data;
}
function getSewReadyModelsAccepted(data) {
  sewReadyModelsAcceptedData.value = data;
}
function getSewReadyModelsPending(data) {
  sewReadyModelsPendingData.value = data;
}
function getSewModelsCutDefectAccepted(data) {
  sewModelsCutDefectAcceptedData.value = data;
}
function getSewModelsCutDefectPending(data) {
  sewModelsCutDefectPendingData.value = data;
}
function getSewModelsPackageAccepted(data) {
  sewModelsPackageAcceptedData.value = data;
}
function getSewModelsPackagePending(data) {
  sewModelsPackagePendingData.value = data;
}
function getPackageModelsAccepted(data) {
  packageModelsAcceptedData.value = data;
}
function getPackageModelsPending(data) {
  packageModelsPendingData.value = data;
}
function getPackageReadyModelsAccepted(data) {
  packageReadyModelsAcceptedData.value = data;
}
function getPackageReadyModelsPending(data) {
  packageReadyModelsPendingData.value = data;
}
function getPackageModelsCutDefectAccepted(data) {
  packageModelsCutDefectAcceptedData.value = data;
}
function getPackageModelsCutDefectPending(data) {
  packageModelsCutDefectPendingData.value = data;
}
function getPackageModelsProductWarehouseAccepted(data) {
  packageModelsProductWarehouseAcceptedData.value = data;
}
function getPackageModelsProductWarehousePending(data) {
  packageModelsProductWarehousePendingData.value = data;
}
function getSaleProducts(data) {
  saleProductsData.value = data;
}
</script>

<template>
  <div class="flex justify-end q-gutter-x-md q-mb-sm">
    <q-btn color="primary" icon="mdi-chevron-double-left" @click="$refs.stepper.previous()" :disable="step === 1" />
    <q-btn color="primary" icon="mdi-chevron-double-right" @click="$refs.stepper.next()" :disable="step === 6" />
  </div>
  <q-stepper
    flat
    v-model="step"
    ref="stepper"
    color="primary"
    animated
    alternative-labels
    keep-alive
    :vertical="$q.screen.lt.md"
  >
    <q-step
      :name="1"
      :title="t('menus.sideBar.cutting')"
      :caption="cutModelsAcceptedData.value?.total"
      icon="mdi-scissors-cutting"
      :done="step > 1"
    >
      <q-card flat bordered class="q-pa-sm text-weight-medium q-mb-md">
        <q-expansion-item
          expand-separator
          label="Qo'shimcha ma'lumotlar"
          header-class="text-primary"
        >
          <q-card>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Bichilgan mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ cutModelsAcceptedData.value?.total || 0 }} {{ cutModelsPendingData.value?.total ? `(+ Kutilmoqda: ${cutModelsPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Qabul qilingan brag mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ cutModelsDefectAcceptedData.value?.total || 0 }} {{ cutModelsDefectPendingData.value?.total ? `(+ Kutilmoqda: ${cutModelsDefectPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
          </q-card>
        </q-expansion-item>
        <q-card-section>
          <div class="text-bold">Bichildi: {{ cutModelsAcceptedData.value?.total }} {{ cutModelsPendingData.value?.total ? `(+ Kutilmoqda: ${cutModelsPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Vishivkaga Jo'natildi -> {{ cutModelsEmbroideryAcceptedData.value?.total || 0 }} {{ cutModelsEmbroideryPendingData.value?.total ? `(+ Kutilmoqda: ${cutModelsEmbroideryPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Tikuvga Jo'natildi -> {{ cutModelsSewAcceptedData.value?.total || 0 }} {{ cutModelsSewPendingData.value?.total ? `(+ Kutilmoqda: ${cutModelsSewPendingData.value.total})` : ''  }}</div>
        </q-card-section>
      </q-card>

      <CutModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsAcceptedData" />
      <CutModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsPendingData" />
      <CutModelsDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsDefectAcceptedData" />
      <CutModelsDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsDefectPendingData" />
      <CutModelsEmbroideryAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsEmbroideryAccepted" />
      <CutModelsEmbroideryPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsEmbroideryPending" />
      <CutModelsSewAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsSewAccepted" />
      <CutModelsSewPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsSewPending" />
    </q-step>
    <q-step
      :name="2"
      :title="t('menus.sideBar.embroidery')"
      :caption="embroideryModelsAcceptedData.value?.total || 0"
      icon="mdi-draw"
      :done="step > 2"
    >
      <q-card flat bordered class="q-pa-sm text-weight-medium q-mb-md">
        <q-expansion-item
          expand-separator
          label="Qo'shimcha ma'lumotlar"
          header-class="text-primary"
        >
          <q-card>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Vishivka urilgan mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ embroideryModelsAcceptedData.value?.total || 0 }} {{ embroideryModelsPendingData.value?.total ? `(+ Kutilmoqda: ${embroideryModelsPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Bichuv bragga jo'natildi:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ embroideryModelsCutDefectAcceptedData.value?.total || 0 }} {{ embroideryModelsCutDefectPendingData.value?.total ? `(+ Kutilmoqda: ${embroideryModelsCutDefectPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
          </q-card>
        </q-expansion-item>
        <q-card-section>
          <div class="text-bold">Qabul Qilindi -> {{ cutModelsEmbroideryAcceptedData.value?.total || 0 }} {{ cutModelsEmbroideryPendingData.value?.total ? `(+ Kutilmoqda: ${cutModelsEmbroideryPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Vishivka Urildi: {{ embroideryModelsAcceptedData.value?.total || 0 }} {{ embroideryModelsPendingData.value?.total ? `(+ Kutilmoqda: ${embroideryModelsPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Bichuv Bragga Jo'natildi -> {{ embroideryModelsCutDefectAcceptedData.value?.total || 0 }} {{ embroideryModelsCutDefectPendingData.value?.total ? `(+ Kutilmoqda: ${embroideryModelsCutDefectPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Tikuvga Jo'natildi -> {{ embroideryModelsSewAcceptedData.value?.total || 0 }} {{ embroideryModelsSewPendingData.value?.total ? `(+ Kutilmoqda: ${embroideryModelsSewPendingData.value.total})` : ''  }}</div>
        </q-card-section>
      </q-card>

      <EmbroideryModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsAcceptedData" />
      <EmbroideryModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsPendingData" />
      <EmbroideryModelsCutDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsCutDefectAccepted" />
      <EmbroideryModelsCutDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsCutDefectPending" />
      <EmbroideryModelsSewAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsSewAccepted" />
      <EmbroideryModelsSewPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsSewPending" />
    </q-step>
    <q-step
      :name="3"
      :title="t('menus.sideBar.sewing')"
      :caption="sewReadyModelsAcceptedData.value?.total || 0"
      icon="mdi-nail"
      :done="step > 3"
    >
      <q-card flat bordered class="q-pa-sm text-weight-medium q-mb-md">
        <q-expansion-item
          expand-separator
          label="Qo'shimcha ma'lumotlar"
          header-class="text-primary"
        >
          <q-card>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Tiligan mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ sewReadyModelsAcceptedData.value?.total || 0 }} {{ sewReadyModelsPendingData.value?.total ? `(+ Kutilmoqda: ${sewReadyModelsPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Bichuv bragga jo'natildi:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ sewModelsCutDefectAcceptedData.value?.total || 0 }} {{ sewModelsCutDefectPendingData.value?.total ? `(+ Kutilmoqda: ${sewModelsCutDefectPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
          </q-card>
        </q-expansion-item>
        <q-card-section>
          <div class="text-bold">Qabul Qilindi -> {{ sewModelsAcceptedData.value?.total || 0 }} {{ sewModelsPendingData.value?.total ? `(+ Kutilmoqda: ${sewModelsPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Tikildi: {{ sewReadyModelsAcceptedData.value?.total || 0 }} {{ sewReadyModelsPendingData.value?.total ? `(+ Kutilmoqda: ${sewReadyModelsPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Bichuv Bragga Jo'natildi -> {{ sewModelsCutDefectAcceptedData.value?.total || 0 }} {{ sewModelsCutDefectPendingData.value?.total ? `(+ Kutilmoqda: ${sewModelsCutDefectPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Upakovkaga Jo'natildi -> {{ sewModelsPackageAcceptedData.value?.total || 0 }} {{ sewModelsPackagePendingData.value?.total ? `(+ Kutilmoqda: ${sewModelsPackagePendingData.value.total})` : ''  }}</div>
        </q-card-section>
      </q-card>

      <SewModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsAccepted" />
      <SewModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsPending" />
      <SewReadyModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewReadyModelsAccepted" />
      <SewReadyModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewReadyModelsPending" />
      <SewModelsCutDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsCutDefectAccepted" />
      <SewModelsCutDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsCutDefectPending" />
      <SewModelsPackageAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsPackageAccepted" />
      <SewModelsPackagePending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsPackagePending" />
    </q-step>
    <q-step
      :name="4"
      :title="t('menus.sideBar.package')"
      :caption="packageReadyModelsAcceptedData.value?.total || 0"
      icon="mdi-package-down"
      :done="step > 4"
    >
      <q-card flat bordered class="q-pa-sm text-weight-medium q-mb-md">
        <q-expansion-item
          expand-separator
          label="Qo'shimcha ma'lumotlar"
          header-class="text-primary"
        >
          <q-card>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Qadoqlangan mahsulotlar:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ packageReadyModelsAcceptedData.value?.total || 0 }} {{ packageReadyModelsPendingData.value?.total ? `(+ Kutilmoqda: ${packageReadyModelsPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
            <div>
              <q-splitter v-model="splitterModel">
                <template v-slot:before>
                  <q-card-section>Bichuv bragga jo'natildi:</q-card-section>
                </template>
                <template v-slot:after>
                  <q-card-section>{{ packageModelsCutDefectAcceptedData.value?.total || 0 }} {{ packageModelsCutDefectPendingData.value?.total ? `(+ Kutilmoqda: ${packageModelsCutDefectPendingData.value?.total})` : ''  }}</q-card-section>
                </template>
              </q-splitter>
              <q-separator inset />
            </div>
          </q-card>
        </q-expansion-item>
        <q-card-section>
          <div class="text-bold">Qabul Qilindi -> {{ packageModelsAcceptedData.value?.total || 0 }} {{ packageModelsPendingData.value?.total ? `(+ Kutilmoqda: ${packageModelsPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Qadoqlandi: {{ packageReadyModelsAcceptedData.value?.total || 0 }} {{ packageReadyModelsPendingData.value?.total ? `(+ Kutilmoqda: ${packageReadyModelsPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Bichuv Bragga Jo'natildi -> {{ packageModelsCutDefectAcceptedData.value?.total || 0 }} {{ packageModelsCutDefectPendingData.value?.total ? `(+ Kutilmoqda: ${packageModelsCutDefectPendingData.value.total})` : ''  }}</div>
          <div class="text-bold">Skladga Jo'natildi -> {{ packageModelsProductWarehouseAcceptedData.value?.total || 0 }} {{ packageModelsProductWarehousePendingData.value?.total ? `(+ Kutilmoqda: ${packageModelsProductWarehousePendingData.value.total})` : ''  }}</div>
        </q-card-section>
      </q-card>

      <PackageModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsAccepted" />
      <PackageModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsPending" />
      <PackageReadyModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageReadyModelsAccepted" />
      <PackageReadyModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageReadyModelsPending" />
      <PackageModelsCutDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsCutDefectAccepted" />
      <PackageModelsCutDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsCutDefectPending" />
      <PackageModelsProductWarehouseAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsProductWarehouseAccepted" />
      <PackageModelsProductWarehousePending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsProductWarehousePending" />
    </q-step>
    <q-step
      :name="5"
      :title="t('menus.sideBar.sales')"
      :caption="saleProductsData.value?.totalQuantity || 0"
      icon="mdi-cart-percent"
      :done="step > 5"
    >
      <SaleProducts :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSaleProducts" />
    </q-step>
    <q-step
      :name="6"
      :title="t('menus.sideBar.expenses')"
      icon="mdi-wallet"
    >
      <ExpensesTransactions :date-to="props.dateTo" :date-from="props.dateFrom" />
    </q-step>
  </q-stepper>
</template>
