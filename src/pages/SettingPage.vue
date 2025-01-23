<script setup>
import { computed, onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import { useMaterial } from "stores/material.js";
import { useRipeMaterial } from "stores/ripeMaterial.js";
import { usePaintFabric } from "stores/paintFabric.js";
import { useColor } from "stores/color.js";
import { useProductModels } from "stores/productModel.js";
import ThreadTable from "components/tables/ThreadTable.vue";
import UnripeMaterialTable from "components/tables/UnripeMaterialTable.vue";
import FabricTable from "components/tables/FabricTable.vue";
import FabricColorTable from "components/tables/FabricColorTable.vue";
import RipeMaterialTable from "components/tables/RipeMaterialTable.vue";
import ModelTable from "components/tables/modelTable.vue";

const tab = ref('thread');

const thread = useThread();
const threads = ref([]);
const threadTotal = ref(0);
const threadLoading = ref(false);
const threadPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const threadPagesNumber = computed(() => Math.ceil(threadTotal.value / threadPagination.value.rowsPerPage));
function getThreads (filterProps) {
  let props = filterProps || {};

  threadLoading.value = true;
  thread.fetchThreads(props || '')
    .then((res) => {
      threads.value = res.data['hydra:member'];
      threadTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}

const material = useMaterial();
const materials = ref([]);
const materialTotal = ref(0);
const materialLoading = ref(false);
const materialPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const materialPagesNumber = computed(() => Math.ceil(materialTotal.value / materialPagination.value.rowsPerPage));
function getMaterials (filterProps) {
  let props = filterProps || {};
  materialLoading.value = true;

  material.fetchMaterials(props || '')
    .then((res) => {
      materials.value = res.data['hydra:member'];
      materialTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      materialLoading.value = false;
    });
}

const ripeMaterial = useRipeMaterial();
const ripeMaterials = ref([]);
const ripeMaterialTotal = ref(0);
const ripeMaterialLoading = ref(false);
const ripeMaterialPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const ripeMaterialPagesNumber = computed(() => Math.ceil(ripeMaterialTotal.value / ripeMaterialPagination.value.rowsPerPage));
function getRipeMaterials (filterProps) {
  let props = filterProps || {};
  ripeMaterialLoading.value = true;

  ripeMaterial.fetchRipeMaterials(props || '')
    .then((res) => {
      ripeMaterials.value = res.data['hydra:member'];
      ripeMaterialTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      ripeMaterialLoading.value = false;
    });
}

const fabric = usePaintFabric();
const fabrics = ref([]);
const fabricTotal = ref(0);
const fabricLoading = ref(false);
const fabricPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const fabricPagesNumber = computed(() => Math.ceil(fabricTotal.value / fabricPagination.value.rowsPerPage));
function getFabrics (filterProps) {
  let props = filterProps || {};
  fabricLoading.value = true;
  fabric.fetchFabrics(props || '')
    .then((res) => {
      fabrics.value = res.data['hydra:member'];
      fabricTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      fabricLoading.value = false;
    });
}

const color = useColor();
const colors = ref([]);
const colorTotal = ref(0);
const colorLoading = ref(false);
const colorPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const colorPagesNumber = computed(() => Math.ceil(colorTotal.value / colorPagination.value.rowsPerPage));
function getColors (filterProps) {
  let props = filterProps || {};
  colorLoading.value = true;
  color.fetchColors(props || '')
    .then((res) => {
      colors.value = res.data['hydra:member'];
      colorTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      colorLoading.value = false;
    });
}

const model = useProductModels();
const models = ref([]);
const modelTotal = ref(0);
const modelLoading = ref(false);
const modelPagination = ref({
  rowsPerPage: 10,
  page: 1,
  descending: true,
  rowsNumber: 0
});
const modelPagesNumber = computed(() => Math.ceil(modelTotal.value / modelPagination.value.rowsPerPage));
function getModels (filterProps) {
  let props = filterProps || {};
  modelLoading.value = true;
  model.fetchProductModels(props || '')
    .then((res) => {
      models.value = res.data['hydra:member'];
      modelTotal.value = res.data['hydra:totalItems'];
    })
    .finally(() => {
      modelLoading.value = false;
    });
}

 function refresh () {
   threadPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   materialPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   ripeMaterialPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   fabricPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   colorPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   modelPagination.value = {
     rowsPerPage: 10,
     page: 1,
     descending: true,
     rowsNumber: 0
   };
   getThreads();
   getMaterials();
   getRipeMaterials();
   getFabrics();
   getColors();
   getModels();
 }

onMounted(() => {
  refresh();
})
</script>

<template>
  <div class="flex justify-between q-gutter-md">
    <q-tabs
      v-model="tab"
      no-caps
      dense
      outside-arrows
      mobile-arrows
      class="shadow-2 text-primary"
      :class="$q.screen.xs ? 'full-width' : ''"
    >
      <q-tab name="thread" :label="$t('tables.thread.header.title')"/>
      <q-tab name="unripeMaterial" :label="$t('tables.unripeMaterial.header.title')"/>
      <q-tab name="ripeMaterial" :label="$t('tables.ripeMaterial.header.title')"/>
      <q-tab name="fabric" :label="$t('tables.fabric.header.title')"/>
      <q-tab name="color" :label="$t('tables.color.header.title')"/>
      <q-tab name="model" :label="$t('tables.model.header.title')"/>
    </q-tabs>
    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>

  <div class="q-py-md">
    <q-tab-panels
      v-model="tab"
      animated
    >
      <q-tab-panel name="thread" class="q-pa-none">
        <thread-table
          :threads="threads"
          :pagination="threadPagination"
          :loading="threadLoading"
          @submit="refresh"
        />
        <div
          v-if="threadTotal > threadPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="threadLoading"
            v-model="threadPagination.page"
            input-class="text-bold text-black"
            :max="threadPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getThreads({ page: threadPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="unripeMaterial" class="q-pa-none">
        <unripe-material-table
          :materials="materials"
          :pagination="materialPagination"
          :loading="materialLoading"
          @submit="refresh"
        />
        <div
          v-if="materialTotal > materialPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="materialLoading"
            v-model="materialPagination.page"
            input-class="text-bold text-black"
            :max="materialPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getMaterials({ page: materialPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="ripeMaterial" class="q-pa-none">
        <ripe-material-table
          :materials="ripeMaterials"
          :pagination="ripeMaterialPagination"
          :loading="ripeMaterialLoading"
          @submit="refresh"
        />
        <div
          v-if="ripeMaterialTotal > ripeMaterialPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="ripeMaterialLoading"
            v-model="ripeMaterialPagination.page"
            input-class="text-bold text-black"
            :max="ripeMaterialPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getRipeMaterials({ page: ripeMaterialPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="fabric" class="q-pa-none">
        <fabric-table
          :fabrics="fabrics"
          :pagination="fabricPagination"
          :loading="fabricLoading"
          @submit="refresh"
        />
        <div
          v-if="fabricTotal > fabricPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="fabricLoading"
            v-model="fabricPagination.page"
            input-class="text-bold text-black"
            :max="fabricPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getFabrics({ page: fabricPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="color" class="q-pa-none">
        <fabric-color-table
          :colors="colors"
          :pagination="colorPagination"
          :loading="colorLoading"
          @submit="refresh"
        />
        <div
          v-if="colorTotal > colorPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="colorLoading"
            v-model="colorPagination.page"
            input-class="text-bold text-black"
            :max="colorPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getColors({ page: colorPagination.page })"
          />
        </div>
      </q-tab-panel>
      <q-tab-panel name="model" class="q-pa-none">
        <model-table
          :models="models"
          :pagination="modelPagination"
          :loading="modelLoading"
          @submit="refresh"
        />
        <div
          v-if="modelTotal > modelPagination.rowsPerPage"
          class="row justify-center q-mt-md"
        >
          <q-pagination
            :disable="modelLoading"
            v-model="modelPagination.page"
            input-class="text-bold text-black"
            :max="modelPagesNumber"
            color="primary"
            input
            size="md"
            @update:model-value="getModels({ page: modelPagination.page })"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
