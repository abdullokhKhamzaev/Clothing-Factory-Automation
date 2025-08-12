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
import PackageModelsProductWarehouseAccepted from "components/statistics/PackageModelsProductWarehouseAccepted.vue";
import PackageModelsProductWarehousePending from "components/statistics/PackageModelsProductWarehousePending.vue";
import SaleProducts from "components/statistics/SaleProducts.vue";
import ExpensesTransactions from "components/statistics/ExpensesTransactions.vue";
import ExchangeTable from "components/tables/ExchangeTable.vue";

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
const sewReadyModelsAcceptedData = ref([])
const sewReadyModelsPendingData = ref([])
const sewModelsCutDefectAcceptedData = ref([])
const sewModelsCutDefectPendingData = ref([])
const sewModelsPackageAcceptedData = ref([])
const sewModelsPackagePendingData = ref([])
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
const cutTab = ref('done');
const embroideryTab = ref('done');
const sewTab = ref('done');
const packageTab = ref('done');
</script>

<template>
  <div class="flex justify-end q-gutter-x-md q-mb-sm">
    <q-btn color="primary" icon="mdi-chevron-double-left" @click="$refs.stepper.previous()" :disable="step === 1" />
    <q-btn color="primary" icon="mdi-chevron-double-right" @click="$refs.stepper.next()" :disable="step === 7" />
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
      :caption="cutModelsAcceptedData.value?.total || '0'"
      icon="mdi-scissors-cutting"
      :done="step > 1"
    >
      <q-card>
        <q-tabs
          v-model="cutTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          outside-arrows
          no-caps
          narrow-indicator
        >
          <q-tab name="done" label="Bichildi" />
          <q-tab name="donePending" label="Bichildi (kutilmoqda)" />
          <q-tab name="defect" label="Brag" />
          <q-tab name="defectPending" label="Brag (kutilmoqda)" />
          <q-tab name="toEmbroideryDone" label="Vishivkaga jo'natildi" />
          <q-tab name="toEmbroideryPending" label="Vishivkani (Kutilmoqda)" />
          <q-tab name="toSewDone" label="Tikuvga jo'natildi" />
          <q-tab name="toSewPending" label="Tikuvni (Kutilmoqda)" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="cutTab" animated>
          <q-tab-panel name="done">
            <CutModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsAcceptedData" />
          </q-tab-panel>
          <q-tab-panel name="donePending">
            <CutModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsPendingData" />
          </q-tab-panel>
          <q-tab-panel name="defect">
            <CutModelsDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsDefectAcceptedData" />
          </q-tab-panel>
          <q-tab-panel name="defectPending">
            <CutModelsDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsDefectPendingData" />
          </q-tab-panel>
          <q-tab-panel name="toEmbroideryDone">
            <CutModelsEmbroideryAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsEmbroideryAccepted" />
          </q-tab-panel>
          <q-tab-panel name="toEmbroideryPending">
            <CutModelsEmbroideryPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsEmbroideryPending" />
          </q-tab-panel>
          <q-tab-panel name="toSewDone">
            <CutModelsSewAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsSewAccepted" />
          </q-tab-panel>
          <q-tab-panel name="toSewPending">
            <CutModelsSewPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getCutModelsSewPending" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-step>
    <q-step
      :name="2"
      :title="t('menus.sideBar.embroidery')"
      :caption="embroideryModelsAcceptedData.value?.total || '0'"
      icon="mdi-draw"
      :done="step > 2"
    >
      <q-card>
        <q-tabs
          v-model="embroideryTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          outside-arrows
          no-caps
          narrow-indicator
        >
          <q-tab name="done" label="Vishivka urildi" />
          <q-tab name="donePending" label="Vishivka urildi (kutilmoqda)" />
          <q-tab name="toDefect" label="Brakga jo'natildi" />
          <q-tab name="toDefectPending" label="Brakni (kutilmoqda)" />
          <q-tab name="toSewDone" label="Tikuvga jo'natildi" />
          <q-tab name="toSewPending" label="Tikuvni (Kutilmoqda)" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="embroideryTab" animated>
          <q-tab-panel name="done">
            <EmbroideryModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsAcceptedData" />
          </q-tab-panel>
          <q-tab-panel name="donePending">
            <EmbroideryModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsPendingData" />
          </q-tab-panel>
          <q-tab-panel name="toDefect">
            <EmbroideryModelsCutDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsCutDefectAccepted" />
          </q-tab-panel>
          <q-tab-panel name="toDefectPending">
            <EmbroideryModelsCutDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsCutDefectPending" />
          </q-tab-panel>
          <q-tab-panel name="toSewDone">
            <EmbroideryModelsSewAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsSewAccepted" />
          </q-tab-panel>
          <q-tab-panel name="toSewPending">
            <EmbroideryModelsSewPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getEmbroideryModelsSewPending" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-step>
    <q-step
      :name="3"
      :title="t('menus.sideBar.sewing')"
      :caption="sewReadyModelsAcceptedData.value?.total || '0'"
      icon="mdi-nail"
      :done="step > 3"
    >
      <q-tabs
        v-model="sewTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        outside-arrows
        no-caps
        narrow-indicator
      >
        <q-tab name="done" label="Tikildi" />
        <q-tab name="donePending" label="Tikildi (kutilmoqda)" />
        <q-tab name="toDefect" label="Brakga jo'natildi" />
        <q-tab name="toDefectPending" label="Brakni (kutilmoqda)" />
        <q-tab name="toPackage" label="Upakovkaga jo'natildi" />
        <q-tab name="toPackagePending" label="Upakovkani (kutilmoqda)" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="sewTab" animated>
        <q-tab-panel name="done">
          <SewReadyModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewReadyModelsAccepted" />
        </q-tab-panel>
        <q-tab-panel name="donePending">
          <SewReadyModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewReadyModelsPending" />
        </q-tab-panel>
        <q-tab-panel name="toDefect">
          <SewModelsCutDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsCutDefectAccepted" />
        </q-tab-panel>
        <q-tab-panel name="toDefectPending">
          <SewModelsCutDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsCutDefectPending" />
        </q-tab-panel>
        <q-tab-panel name="toPackage">
          <SewModelsPackageAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsPackageAccepted" />
        </q-tab-panel>
        <q-tab-panel name="toPackagePending">
          <SewModelsPackagePending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSewModelsPackagePending" />
        </q-tab-panel>
      </q-tab-panels>
    </q-step>
    <q-step
      :name="4"
      :title="t('menus.sideBar.package')"
      :caption="packageReadyModelsAcceptedData.value?.total || '0'"
      icon="mdi-package-down"
      :done="step > 4"
    >
      <q-tabs
        v-model="packageTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        outside-arrows
        no-caps
        narrow-indicator
      >
        <q-tab name="done" label="Qadoqlandi" />
        <q-tab name="donePending" label="Qadoqni (kutilmoqda)" />
        <q-tab name="toDefect" label="Brakga jo'natildi" />
        <q-tab name="toDefectPending" label="Brakni (kutilmoqda)" />
        <q-tab name="toWarehouse" label="Omborga jo'natildi" />
        <q-tab name="toWarehousePending" label="Omborni (kutilmoqda)" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="packageTab" animated>
        <q-tab-panel name="done">
          <PackageReadyModelsAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageReadyModelsAccepted" />
        </q-tab-panel>
        <q-tab-panel name="donePending">
          <PackageReadyModelsPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageReadyModelsPending" />
        </q-tab-panel>
        <q-tab-panel name="toDefect">
          <PackageModelsCutDefectAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsCutDefectAccepted" />
        </q-tab-panel>
        <q-tab-panel name="toDefectPending">
          <PackageModelsCutDefectPending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsCutDefectPending" />
        </q-tab-panel>
        <q-tab-panel name="toWarehouse">
          <PackageModelsProductWarehouseAccepted :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsProductWarehouseAccepted" />
        </q-tab-panel>
        <q-tab-panel name="toWarehousePending">
          <PackageModelsProductWarehousePending :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getPackageModelsProductWarehousePending" />
        </q-tab-panel>
      </q-tab-panels>
    </q-step>
    <q-step
      :name="5"
      :title="t('menus.sideBar.sales')"
      :caption="saleProductsData.value?.totalQuantity || '0'"
      icon="mdi-cart-percent"
      :done="step > 5"
    >
      <SaleProducts :date-to="props.dateTo" :date-from="props.dateFrom" @retrieve-data="getSaleProducts" />
    </q-step>
    <q-step
      :name="6"
      :title="t('menus.sideBar.expenses')"
      icon="mdi-wallet"
      :done="step > 6"
    >
      <ExpensesTransactions :date-to="props.dateTo" :date-from="props.dateFrom" />
    </q-step>
    <q-step
      :name="7"
      :title="t('exchanges')"
      icon="mdi-send-clock-outline"
    >
      <exchange-table :date-to="props.dateTo" :date-from="props.dateFrom" />
    </q-step>
  </q-stepper>
</template>
