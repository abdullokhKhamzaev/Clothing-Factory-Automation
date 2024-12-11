<template>
  <div class="q-pa-md">
    <div class="flex q-mb-md">
      <q-btn
        color="primary"
        label="Foydalanuvchi qo'shish"
        no-caps
        icon-right="add"
        @click="icon = true"
      />
    </div>

    <q-table
      flat bordered
      :rows="rows"
      :columns="columns"
      color="primary"
      row-key="name"
      :loading="loading"
      :visible-columns="visibleColumns"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:top>
        <div class="col-12 flex justify-between">
          <q-select
            v-model="visibleColumns"
            multiple
            outlined
            dense
            options-dense
            :display-value="$q.lang.table.columns"
            emit-value
            map-options
            :options="columns"
            option-value="name"
            label="Ustunlar"
            options-cover
            style="min-width: 150px"
            :class="$q.screen.lt.sm ? 'full-width q-mb-md' : false"
          />
          <q-input
            outlined
            v-model="search"
            :class="$q.screen.lt.sm ? 'full-width' : false"
            label="Ism"
            name="Name"
            clearable
            dense
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            auto-width
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <div v-if="col.name === 'name'">
              <div class="q-gutter-sm flex no-wrap items-center">
                <q-avatar>
                  <q-img :src="props.row.photo" />
                </q-avatar>
                <div class="q-ml-sm">{{ props.row.name }}</div>
              </div>
            </div>
            <div v-else>
              {{ col.value }}
            </div>
          </q-td>
          <q-td auto-width>
            <div class="q-gutter-x-sm">
              <q-btn size="md" color="primary" rounded dense icon='edit'>
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  O'zgartirish
                </q-tooltip>
              </q-btn>
              <q-btn size="md" color="red" rounded dense icon='delete' @click="confirm = true">
                <q-tooltip transition-show="flip-right" transition-hide="flip-left" anchor="bottom middle" self="top middle" :offset="[5, 5]">
                  O'chirish
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="icon">
      <q-card style="width: 900px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Create user</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form
            @submit="() => console.log('submit')"
            @reset="() => console.log('onReset')"
            class="q-gutter-md"
          >
            <q-input
              filled
              v-model="search"
              label="Your name *"
              hint="Name and surname"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />

            <q-input
              filled
              type="number"
              v-model="search"
              label="Your age *"
              lazy-rules
              :rules="[
              val => val !== null && val !== '' || 'Please type your age',
              val => val > 0 && val < 100 || 'Please type a real age'
            ]"
            />

            <div>
              <q-btn label="Submit" type="submit" color="primary"/>
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row flex items-center q-pb-none">
          <div class="text-h6">Confirm Deletion</div>
          <q-space />
          <q-icon name="delete" color="grey" size="sm" />
        </q-card-section>

        <q-card-section>
          Are you sure you want to delete this item? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-mb-sm">
          <q-btn label="Cancel" color="primary" v-close-popup />
          <q-btn label="Confirm" color="red" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import {ref} from 'vue'
const search = ref('')
const loading = ref(false);
const icon = ref(false);
const confirm = ref(false);
const visibleColumns = ref([ 'name', 'phone', 'password', 'salary', 'salaryCurrency', 'roles' ]);
const columns = [
  { name: 'name', label: 'Ism', align: 'left', field: 'name', sortable: true },
  { name: 'phone', label: 'Telefon', align: 'left',  field: 'phone', sortable: true },
  { name: 'password', label: 'Parol', align: 'left', field: 'password' },
  { name: 'salary', label: 'Maosh', align: 'left', field: 'salary', sortable: true },
  { name: 'salaryCurrency', label: 'Valyuta', align: 'left', field: 'salaryCurrency' },
  { name: 'roles', label: 'Status', align: 'left', field: 'roles', sortable: true },
]
const rows = [
  {
    name: 'Abdulloh Hamzayev',
    photo: 'https://avatars.githubusercontent.com/u/101015366?v=4',
    phone: '+998990002217',
    password: 'string',
    salary: 100000,
    salaryCurrency: 'usd',
    roles: 'ROLE_ADMIN'
  },
  {
    name: 'John Doe',
    photo: 'https://westernfinance.org/wp-content/uploads/speaker-3-v2.jpg',
    phone: '+998999999999',
    password: 'string',
    salary: 100000,
    salaryCurrency: 'usd',
    roles: 'ROLE_ADMIN'
  }
]
</script>
