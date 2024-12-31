<script setup>
import { onMounted, ref } from "vue";
import { useThread } from "stores/thread.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const thread = useThread();
const threads = ref([]);

const threadLoading = ref(false);
const columns = [
  { name: 'name', label: t('tables.thread.columns.name'), align: 'left', field: 'name' },
  { name: 'quantity', label: t('tables.thread.columns.quantity'), align: 'left', field: 'quantity' }
];

function getThreads (){
  threadLoading.value = true;
  thread.fetchThreads('?page=1')
    .then((res) => {
      threads.value = res.data['hydra:member'];
    })
    .finally(() => {
      threadLoading.value = false;
    });
}
onMounted(() => {
  getThreads();
})
</script>

<template>
  <div class="q-mx-md q-mt-md">
    <q-table
      flat
      bordered
      :rows="threads"
      :columns="columns"
      :no-data-label="$t('tables.thread.header.empty')"
      :loading="threadLoading"
      color="primary"
      row-key="id"
      hide-bottom
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:top>
        <div class="col-12">
          <div class="q-table__title">{{ $t('tables.thread.header.title') }}</div>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in columns" :key="col.name" :props="props">
            <div
              v-if="col.name === 'quantity'"
              class="flex q-gutter-sm"
            >
              <span> {{ props.row.quantity }} </span>
              <span class="text-weight-bolder"> ({{ props.row.measurement }}) </span>
            </div>

            <div v-else>
              {{ props.row[col.field] || '-' }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
