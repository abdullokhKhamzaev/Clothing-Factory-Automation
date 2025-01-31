<script setup>
import { ref} from "vue";
import { useQuasar } from "quasar";
import PackagingProductWarehouseTable from "components/tables/PackagingProductWarehouseTable.vue";
import PackagingReadyProductWarehouseTable from "components/tables/PackagingReadyProductWarehouseTable.vue";

const $q = useQuasar();
const tab = ref('warehouse');
</script>

<template>
  <div>
    <q-tabs
      v-model="tab"
      no-caps
      dense
      outside-arrows
      mobile-arrows
      class="shadow-2 text-primary"
      :class="$q.screen.xs ? 'full-width' : ''"
    >
      <q-tab name="warehouse" :label="$t('warehouse')"/>
      <q-tab name="packagerReadyWarehouse" :label="$t('warehouses.packagerReadyWarehouse')"/>
    </q-tabs>
  </div>
  <div class="q-py-md">
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="warehouse" class="q-pa-none">
        <packaging-product-warehouse-table />
      </q-tab-panel>
      <q-tab-panel name="packagerReadyWarehouse" class="q-pa-none">
        <packaging-ready-product-warehouse-table />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
