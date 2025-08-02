<script setup>
import { computed, onMounted, ref } from "vue";
import { useWarehouse } from "stores/warehouse.js";
import RefreshButton from "components/RefreshButton.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  }
})

const warehouse = ref([]);
const loading = ref(false);

function getWarehouse () {
  if (loading.value) return; // Prevent multiple rapid calls

  loading.value = true;

  let filterProps = {};

  filterProps.name = props.name;

  useWarehouse().fetchWarehouses(props || '')
    .then((res) => {
      warehouse.value = res.data['hydra:member'][0];
      loading.value = false;
    })
}
function refresh() {
  getWarehouse();
}
const searchTitle = ref();
const filteredProducts = computed(() => {
  if (!searchTitle.value) {
    return warehouse.value.productInWarehouses || [];
  }

  return (warehouse.value.productInWarehouses || []).filter(item =>
    item.productModel.name.toLowerCase().includes(searchTitle.value.toLowerCase())
  );
});

onMounted(() => {
  refresh()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center q-mb-md">
      <div class="text-h4">
        {{ $t('tables.model.header.title') }}
      </div>
      <refresh-button :action="refresh" />
    </div>
    <q-list
      v-show="!loading"
      bordered
      separator
      class="q-mb-md shadow-3"
    >
      <q-input
        style="min-width: 225px"
        dense
        clearable
        v-model="searchTitle"
        class="q-mx-md"
        :label="$t('tables.users.header.searchTitle')"
      >
        <template v-slot:append>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>
      <q-item v-if="!filteredProducts.length">
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-bold">{{ $t('productNotFound') }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-for="(item, index) in filteredProducts"
        :key="item"
      >
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-bold">{{ item.productModel.name }}</q-item-label>
          <q-item-label caption>
          <span
            v-for="size in item.productSize"
            :key="size"
            class="q-pl-xs text-primary text-subtitle2 text-weight-bold"
          >
            {{ size.size }} : {{ size.quantity }} {{ warehouse.productInWarehouses.length !== index ? '' : ',' }}
          </span>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
