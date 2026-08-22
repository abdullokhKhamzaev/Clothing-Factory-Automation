<script setup>
import { computed, onMounted, ref } from "vue";
import { searchMatch } from "src/libraries/transliterate.js";

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
  whichObject: {
    type: String,
    required: false,
    default: null
  },
  filters: {
    type: Object,
    required: false,
    default: Object
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
const items = ref([]);
const filteredOptions = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: '~',
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  ...props.filters
});

const options = computed(() => {
  return items.value.map(item => ({
    label: typeof props.itemLabel === 'string' ? item[props.itemLabel] : item[props.itemLabel.label][props.itemLabel.path],
    value: props.itemValue ? item[props.itemValue] : item
  }));
});

async function getItems() {
  if (loading.value) return;

  loading.value = true;
  try {
    const response = await props.store[props.fetchMethod]({...pagination.value, ...filters.value});

    if (props.whichObject) {
      items.value = response.data[props.itemsKey][0][props.whichObject]
    } else {
      items.value = response.data[props.itemsKey]
    }

    pagination.value.rowsNumber = response.data[props.totalItemsKey];
    stringOptions.value = options.value;
    filteredOptions.value = options.value;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// Dropdown variantlari ({label, value}) uchun ham, tashqaridan dasturiy
// o'rnatilgan xom obyekt uchun ham to'g'ri yorliq qaytaradi
function optionLabel(opt) {
  if (opt && typeof opt === 'object') {
    if (typeof opt.label === 'string') {
      return opt.label;
    }
    try {
      return typeof props.itemLabel === 'string'
        ? opt[props.itemLabel]
        : opt[props.itemLabel.label][props.itemLabel.path];
    } catch {
      return '';
    }
  }
  return opt;
}

function filterFn(val, update) {
  if (val === '') {
    update(() => {
      filteredOptions.value = stringOptions.value;  // Reset to original options
    });
    return;
  }

  update(() => {
    // Lotin/kirill farqisiz qidiradi ("ruxshona" -> "Рухшона")
    filteredOptions.value = stringOptions.value.filter(v => searchMatch(v.label, val));
  });
}

onMounted(() => {
  getItems();
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
    :option-label="optionLabel"
    :rules="[val => !!val || ruleMessage]"
    hide-bottom-space
    @filter="filterFn"
  >
    <template v-slot:loading>
      <q-spinner color="primary" />
    </template>
    <template v-slot:no-option>
      No items available.
    </template>
  </q-select>
</template>
