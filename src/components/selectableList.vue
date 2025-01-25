<script setup>
import { computed, onMounted, ref } from "vue";

const props = defineProps({
  store: {
    type: Object,
    required: true
  },
  disable: {
    type: Boolean,
    required: false,
    default: false
  },
  multiple: {
    type: Boolean,
    required: false,
    default: false
  },
  fetchMethod: {
    type: String,
    required: true
  },
  itemLabel: {
    type: [String, Object],
    required: true,
  },
  itemValue: {
    type: String,
    required: false,
    default: null
  },
  totalItemsKey: {
    type: String,
    default: 'hydra:totalItems'
  },
  itemsKey: {
    type: String,
    default: 'hydra:member'
  },
  label: {
    type: String,
    required: true
  },
  ruleMessage: {
    type: String,
    required: false,
    default: ''
  }
});

const selectedItem = ref(null);
const total = ref(10);
const items = ref([]);
const loading = ref(false);
const page = ref(1);

const options = computed(() => {
  return items.value.map(item => ({
    label: typeof props.itemLabel === 'string' ? item[props.itemLabel] : item[props.itemLabel.label][props.itemLabel.path],
    value: props.itemValue ? item[props.itemValue] : item
  }));
});

async function getItems(filterProps = {}) {
  if (loading.value || items.value.length >= total.value) {
    return;
  }

  loading.value = true;
  try {
    const response = await props.store[props.fetchMethod](filterProps);
    total.value = response.data[props.totalItemsKey];
    items.value = [...items.value, ...response.data[props.itemsKey]];
    page.value++;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

const loadMore = () => {
  if (!loading.value && items.value.length < total.value) {
    getItems({ page: page.value });
  }
};

onMounted(() => {
  getItems({ page: page.value });
})
</script>

<template>
  <q-select
    v-model="selectedItem"
    :disable="disable"
    :multiple="multiple"
    filled
    emit-value
    map-options
    :loading="loading"
    :options="options"
    :label="label"
    option-value="value"
    option-label="label"
    :rules="[val => !!val || ruleMessage]"
    hide-bottom-space
    @virtual-scroll="loadMore"
  >
    <template v-slot:loading>
      <q-spinner color="primary" />
    </template>
    <template v-slot:no-option>
      No items available.
    </template>
  </q-select>
</template>
