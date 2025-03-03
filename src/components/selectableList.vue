<script setup>
import { computed, onMounted, ref } from "vue";

const stringOptions = ref([]);

const props = defineProps({
  store: {
    type: Object,
    required: true
  },
  methodProps: {
    type: Object,
    required: false,
    default: null
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
  clearable: {
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
const filteredOptions = ref([]);
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

  if ( props.methodProps?.types ) {
    filterProps.types = props.methodProps.types
  }

  loading.value = true;
  try {
    const response = await props.store[props.fetchMethod](filterProps);
    total.value = response.data[props.totalItemsKey];
    items.value = [...items.value, ...response.data[props.itemsKey]];
    stringOptions.value = options.value;
    filteredOptions.value = options.value;
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

function filterFn(val, update) {
  if (val === '') {
    update(() => {
      filteredOptions.value = stringOptions.value;  // Reset to original options
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredOptions.value = stringOptions.value.filter(v => v.label.toLowerCase().indexOf(needle) > -1);  // Filter the options
  });
}

onMounted(() => {
  getItems({ page: page.value });
});
</script>

<template>
  <q-select
    v-model="selectedItem"
    use-input
    input-debounce="0"
    :disable="disable"
    :multiple="multiple"
    :clearable="clearable"
    filled
    emit-value
    map-options
    :loading="loading"
    :options="filteredOptions"
    :label="label"
    option-value="value"
    option-label="label"
    :rules="[val => !!val || ruleMessage]"
    hide-bottom-space
    @filter="filterFn"
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
