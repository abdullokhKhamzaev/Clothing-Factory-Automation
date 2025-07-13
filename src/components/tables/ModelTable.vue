<script setup>
import {onMounted, ref} from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useProductModels } from "stores/productModel.js";
import { useBudget } from "stores/budget.js";
import { useAccessory } from "stores/accessory.js";
import { useEmbroidery } from "stores/embroidery.js";
import { useAddFile } from "stores/mediaObject/addFile.js";
import SelectableList from "components/selectableList.vue";
import RefreshButton from "components/RefreshButton.vue";

const $q = useQuasar();
const { t } = useI18n();
const domain = ref(import.meta.env.VITE_API_DOMEN);
const budget = useBudget();
const accessory = useAccessory();
const embroidery = useEmbroidery();

const modelLoading = ref(false);
const selectedData = ref({});
const showCreateModal = ref(false);
const createActionErr = ref(null);
const showUpdateModal = ref(false);
const updateActionErr = ref(null);
let rows = ref([
  { size: '', price: '', productAccessories: [{ accessory: '', quantity: '', workerPrice: '', budget: '' }], embroidery: [] }
])

const columns = [
  { name: 'name', label: t('tables.model.columns.name'), align: 'left', field: 'name' },
  { name: 'description', label: t('tables.model.columns.description'), align: 'left', field: 'description' },
  { name: 'sizes', label: t('tables.model.columns.sizes'), align: 'left', field: 'sizes' },
  { name: 'image', label: t('tables.model.columns.image'), align: 'left', field: 'image' },
  { name: 'action', label: '', align: 'right', field: 'action' }
];
const visibleColumns = ref(columns.map(column => column.name));
// Table Data
const repository = useProductModels();
const items = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  descending: true
});

const filters = ref({
  // ...
});

function getItems () {
  if (loading.value) return; // Prevent multiple rapid calls
  loading.value = true;

  repository.fetchProductModels({...pagination.value, ...filters.value})
    .then((res) => {
      items.value = res.data['hydra:member'];
      pagination.value.rowsNumber = res.data['hydra:totalItems'];
    })
    .finally(() => {
      loading.value = false;
    });
}

function onRequest(params) {
  pagination.value = {...pagination.value, ...params.pagination};
  getItems();
}
function refresh () {
  getItems();
}

onMounted(() => {
  refresh();
})

function addRow() {
  rows.value.push(
    { size: '', price: '', productAccessories: [{ accessory: '', quantity: '', workerPrice: '', budget: '' }], embroidery: [] }
  );
}
function removeRow(index) {
  if (this.rows.length > 1) {
    this.rows.splice(index, 1);
  }
}
function addAccessoryRow(index) {
  rows.value[index].productAccessories.push(
    { accessory: '', quantity: '', workerPrice: '', budget: '' }
  );
}
function removeAccessoryRow(index) {
  if ( rows.value[index].productAccessories.length > 1 ) {
    rows.value[index].productAccessories.splice(index, 1);
  }
}
function prefill() {
  let sizes = [];
  selectedData.value.sizes.forEach((size) => {
    sizes.push({ size: size.size, price: size.price, productAccessories: size.productAccessories, embroidery: size.embroidery });
  });

  // selectedData.value.image ='http://localhost:8888/' + selectedData.value.image.contentUrl;

  sizes.forEach((size) => {
    let embroideries = [];

    size.embroidery.forEach((embroidery) => {
      embroideries.push(embroidery['@id'])
    })

    size.embroidery = embroideries;
  })

  rows.value = sizes;
}
function createAction() {
  if (modelLoading.value) return; // Prevent multiple rapid calls

  modelLoading.value = true;

  let sizes = [];

  rows.value.forEach((row) => {
    sizes.push({size: row.size, price: row.price, productAccessories: row.productAccessories, embroidery: row.embroidery});
  })

  const input = {
    name: selectedData.value.name,
    description: selectedData.value.description,
    sizes: sizes,
    budget: selectedData.value.budget,
  }

  if (selectedData.value.image) {
    useAddFile().addFile(selectedData.value.image)
      .then((res) => {
        input.image = res.data['@id']

        repository.create(input)
          .then(() => {
            showCreateModal.value = false;
            $q.notify({
              type: 'positive',
              position: 'top',
              timeout: 1000,
              message: t('forms.model.confirmation.successCreated')
            })
            clearAction();
            refresh();
          })
          .catch((res) => {
            createActionErr.value = res.response.data['hydra:description'];

            $q.notify({
              type: 'negative',
              position: 'top',
              timeout: 1000,
              message: t('forms.model.confirmation.failure')
            })
          })
          .finally(() => modelLoading.value = false);
      })
  } else {
    repository.create(input)
      .then(() => {
        showCreateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.model.confirmation.successCreated')
        })
        clearAction();
        refresh();
      })
      .catch((res) => {
        createActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.model.confirmation.failure')
        })
      })
      .finally(() => modelLoading.value = false);
  }
}
function updateAction() {
  if (selectedData.value.id) {
    if (modelLoading.value) return; // Prevent multiple rapid calls

    modelLoading.value = true;

    let sizes = [];

    rows.value.forEach((row) => {
      sizes.push({size: row.size, price: row.price, productAccessories: row.productAccessories, embroidery: row.embroidery});
    })

    const input = {
      name: selectedData.value.name,
      description: selectedData.value.description,
      sizes: sizes,
      budget: selectedData.value.budget,
      embroideries: selectedData.value.embroideries
    }

    repository.update(selectedData.value.id, input)
      .then(() => {
        showUpdateModal.value = false;
        $q.notify({
          type: 'positive',
          position: 'top',
          timeout: 1000,
          message: t('forms.model.confirmation.successEdited')
        });
        clearAction();
        refresh();
      })
      .catch((res) => {
        updateActionErr.value = res.response.data['hydra:description'];

        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 1000,
          message: t('forms.model.confirmation.failure')
        })
      })
      .finally(() => modelLoading.value = false);
  } else {
    console.warn('data is empty');
  }
  clearAction();
}

function clearAction() {
  selectedData.value = {};
  createActionErr.value = null;
  updateActionErr.value = null;
  rows.value = [{ size: '', price: '', productAccessories: [{ accessory: '', quantity: '', workerPrice: '', budget: '' }], embroidery: [] }]
}
</script>

<template>
  <q-table
    flat
    bordered
    color="primary"
    :no-data-label="$t('tables.transaction.header.empty')"
    :columns="columns"
    :visible-columns="visibleColumns"
    :rows="items"
    row-key="id"
    v-model:pagination.sync="pagination"
    :rows-per-page-options="[10, 25, 50, 100, '~']"
    :loading="loading"
    @request="onRequest"
  >
    <template v-slot:top>
      <div class="col-12 q-gutter-y-sm" :class="$q.screen.lt.sm ? '' : 'flex'">
        <div class="q-table__title">{{ $t('tables.model.header.title') }}</div>

        <div class="q-ml-auto" :class="$q.screen.lt.sm ? '' : 'flex q-gutter-sm'">
          <refresh-button :action="refresh" class="q-mb-md q-mb-sm-none" />
          <q-btn
            color="primary"
            icon-right="add"
            :label="$t('tables.model.buttons.add')"
            no-caps
            @click="showCreateModal = true"
            class="q-mb-md q-mb-sm-none"
          />
          <q-select
            dense
            multiple
            outlined
            options-dense
            emit-value
            map-options
            v-model="visibleColumns"
            :display-value="$q.lang.table.columns"
            :options="columns"
            option-value="name"
            :label="$t('columns')"
            class="w-full"
          />
        </div>
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in columns" :key="col.name" :props="props">
          <div v-if="col.name === 'sizes'">
            <div
              v-for="size in props.row.sizes"
              :key="size.id"
            >
              {{ size.size }} |
              {{ size.price }}
            </div>
          </div>
          <div
            v-else-if="col.name === 'action'"
            class="flex justify-end">
            <div class="flex no-wrap q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon="edit" @click="selectedData = {...props.row}; prefill(); showUpdateModal = true">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  {{ $t('edit') }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <div v-else-if="col.name === 'image'">
            <q-img
              v-if="props?.row?.image?.contentUrl"
              :src="domain + props.row.image.contentUrl"
              style="max-width: 50px"
            />
            <div v-else>
              -
            </div>
          </div>
          <div v-else>
            {{ props.row[col.field] || '-' }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <!-- Dialogs -->
  <q-dialog v-model="showCreateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="createAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="createActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.model.barCreate') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="createActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ createActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.model.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.description"
            :label="$t('forms.model.fields.description.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.description.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-file
            v-model="selectedData.image"
            clearable
            :label="$t('forms.embroidery.fields.image.label')"
            filled
            accept="image/*"
            class="col-12"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.model.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.model.fields.budget.validation.required')"
            class="col-12"
          />
        </div>

        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.model.fields.sizes.title') }}
        </div>
        <q-separator class="q-mb-md"/>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <div v-if="index" class="flex items-center">
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <q-input
            filled
            v-model="row.size"
            :label="$t('forms.model.fields.size.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.size.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="row.price"
            :label="$t('forms.model.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.model.fields.price.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <selectable-list
            v-model="row.embroidery"
            :label="$t('forms.model.fields.embroideries.label')"
            :store="embroidery"
            fetch-method="fetchEmbroideries"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.model.fields.embroideries.validation.required')"
            multiple
            clearable
            class="col-12"
          />
          <div class="col-12">
            <div class="row q-card--bordered bg-grey-2 q-pa-md">
              <div class="col-12">
                <div class="text-subtitle1 text-primary">
                  {{ $t('forms.model.fields.productAccessories.title') }}
                </div>
                <div
                  v-for="(consume, i) in row.productAccessories" :key="i"
                  class="row q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
                >
                  <div v-if="i" class="flex items-center">
                    <q-btn icon="mdi-minus" @click="removeAccessoryRow(index)" rounded color="red" dense/>
                  </div>
                  <selectable-list
                    v-model="consume.accessory"
                    :label="$t('forms.model.fields.productAccessories.accessory.label')"
                    :store="accessory"
                    fetch-method="fetchAccessories"
                    item-value="@id"
                    item-label="name"
                    :rule-message="$t('forms.model.fields.productAccessories.accessory.validation.required')"
                    class="col-12"
                  />
                  <q-input
                    filled
                    type="number"
                    v-model="consume.quantity"
                    :label="$t('forms.model.fields.productAccessories.quantity.label')"
                    :rules="[ val => val && val > -1 || $t('forms.model.fields.productAccessories.quantity.validation.required')]"
                    class="col-12"
                    hide-bottom-space
                  />
                  <selectable-list
                    v-model="consume.budget"
                    :label="$t('forms.model.fields.productAccessories.budget.label')"
                    :store="budget"
                    fetch-method="fetchBudgets"
                    item-value="@id"
                    item-label="name"
                    :rule-message="$t('forms.model.fields.productAccessories.budget.validation.required')"
                    class="col-12"
                  />
                  <q-input
                    filled
                    type="number"
                    v-model="consume.workerPrice"
                    :label="$t('forms.model.fields.productAccessories.workerPrice.label')"
                    :rules="[ val => val && val > -1 || $t('forms.model.fields.productAccessories.workerPrice.validation.required')]"
                    class="col-12"
                    hide-bottom-space
                  />
                  <div class="col-12 text-right">
                    <q-btn icon="mdi-plus" rounded color="green-10" @click="addAccessoryRow(index)"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-right q-ma-md">
          <q-btn icon="mdi-plus" rounded color="green" @click="addRow"/>
        </div>
        <q-separator/>
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || modelLoading"
            :loading="loading || modelLoading"
            no-caps
            :label="$t('forms.model.buttons.create')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
  <q-dialog v-model="showUpdateModal" persistent @hide="clearAction">
    <div
      class="bg-white shadow-3"
      style="width: 900px; max-width: 80vw;"
    >
      <q-form @submit.prevent="updateAction">
        <div
          class="q-px-md q-py-sm text-white flex justify-between"
          :class="updateActionErr ? 'bg-red' : 'bg-primary q-mb-lg'"
        >
          <div class="text-h6"> {{ $t('dialogs.model.barEdit') }} </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
        <div v-if="updateActionErr">
          <q-separator color="white" />
          <div class="bg-red q-pa-md text-h6 flex items-center q-mb-lg text-white">
            <q-icon
              class="q-mr-sm"
              name="mdi-alert-circle-outline"
              size="md"
              color="white"
            />
            {{ updateActionErr }}
          </div>
          <q-separator color="white" />
        </div>
        <div class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg">
          <q-input
            filled
            v-model="selectedData.name"
            :label="$t('forms.model.fields.name.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.name.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            v-model="selectedData.description"
            :label="$t('forms.model.fields.description.label')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.description.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <selectable-list
            v-model="selectedData.budget"
            :label="$t('forms.model.fields.budget.label')"
            :store="budget"
            fetch-method="fetchBudgets"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.model.fields.budget.validation.required')"
            class="col-12"
          />
        </div>

        <div class="q-pl-md text-subtitle1 text-primary">
          {{ $t('forms.unripeMaterialOrder.fields.expectedConsumeDtos.title') }}
        </div>
        <q-separator class="q-mb-md"/>
        <div
          v-for="(row, index) in rows" :key="index"
          class="row q-px-md q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
        >
          <div v-if="index" class="flex items-center">
            <q-btn icon="mdi-minus" @click="removeRow(index)" rounded color="red" dense/>
          </div>
          <q-input
            filled
            v-model="row.size"
            :label="$t('forms.model.fields.size.label')"
            :rules="[ val => val && val.length > 0 || $t('forms.model.fields.size.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <q-input
            filled
            type="number"
            v-model="row.price"
            :label="$t('forms.model.fields.price.label')"
            :rules="[ val => val && val > -1 || $t('forms.model.fields.price.validation.required')]"
            class="col-12"
            hide-bottom-space
          />
          <selectable-list
            v-model="row.embroidery"
            :label="$t('forms.model.fields.embroideries.label')"
            :store="embroidery"
            fetch-method="fetchEmbroideries"
            item-value="@id"
            item-label="name"
            :rule-message="$t('forms.model.fields.embroideries.validation.required')"
            multiple
            clearable
            class="col-12"
          />
          <div class="col-12">
            <div class="row q-card--bordered bg-grey-2 q-pa-md">
              <div class="col-12">
                <div class="text-subtitle1 text-primary">
                  {{ $t('forms.model.fields.productAccessories.title') }}
                </div>
                <div
                  v-for="(consume, i) in row.productAccessories" :key="i"
                  class="row q-col-gutter-x-lg q-col-gutter-y-md q-mb-lg"
                >
                  <div v-if="i" class="flex items-center">
                    <q-btn icon="mdi-minus" @click="removeAccessoryRow(index)" rounded color="red" dense/>
                  </div>
                  <selectable-list
                    v-model="consume.accessory"
                    :label="$t('forms.model.fields.productAccessories.accessory.label')"
                    :store="accessory"
                    fetch-method="fetchAccessories"
                    item-value="@id"
                    item-label="name"
                    :rule-message="$t('forms.model.fields.productAccessories.accessory.validation.required')"
                    class="col-12"
                  />
                  <q-input
                    filled
                    type="number"
                    v-model="consume.quantity"
                    :label="$t('forms.model.fields.productAccessories.quantity.label')"
                    :rules="[ val => val && val > -1 || $t('forms.model.fields.productAccessories.quantity.validation.required')]"
                    class="col-12"
                    hide-bottom-space
                  />
                  <selectable-list
                    v-model="consume.budget"
                    :label="$t('forms.model.fields.productAccessories.budget.label')"
                    :store="budget"
                    fetch-method="fetchBudgets"
                    item-value="@id"
                    item-label="name"
                    :rule-message="$t('forms.model.fields.productAccessories.budget.validation.required')"
                    class="col-12"
                  />
                  <q-input
                    filled
                    type="number"
                    v-model="consume.workerPrice"
                    :label="$t('forms.model.fields.productAccessories.workerPrice.label')"
                    :rules="[ val => val && val > -1 || $t('forms.model.fields.productAccessories.workerPrice.validation.required')]"
                    class="col-12"
                    hide-bottom-space
                  />
                  <div class="col-12 text-right">
                    <q-btn icon="mdi-plus" rounded color="green-10" @click="addAccessoryRow(index)"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <q-separator />
        <div class="q-px-md q-py-sm text-center">
          <q-btn
            :disable="loading || modelLoading"
            :loading="loading || modelLoading"
            no-caps
            :label="$t('forms.color.buttons.edit')"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>
