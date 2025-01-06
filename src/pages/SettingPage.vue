<script setup>
import { computed, onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import { useMaterial } from "stores/material.js";
import { usePaintFabric } from "stores/paintFabric.js";
import { useColor } from "stores/color.js";
import ThreadTable from "components/tables/ThreadTable.vue";
import MaterialTable from "components/tables/MaterialTable.vue";
import FabricTable from "components/tables/FabricTable.vue";
import FabricColorTable from "components/tables/FabricColorTable.vue";

const tab = ref('threads');

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
   getThreads();
   getMaterials();
   getFabrics();
   getColors();
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
      <q-tab name="threads" :label="$t('threads')"/>
      <q-tab name="materials" :label="$t('materials')"/>
      <q-tab name="fabrics" :label="$t('fabrics')"/>
      <q-tab name="colors" :label="$t('colors')"/>
    </q-tabs>
    <q-btn size="md" icon="mdi-orbit-variant" color="dark" @click="refresh" />
  </div>

  <div class="q-py-md">
    <q-tab-panels
      v-model="tab"
      animated
    >
      <q-tab-panel name="threads" class="q-pa-none">
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
      <q-tab-panel name="materials" class="q-pa-none">
        <material-table
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
      <q-tab-panel name="fabrics" class="q-pa-none">
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
      <q-tab-panel name="colors" class="q-pa-none">
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
    </q-tab-panels>
  </div>
</template>
