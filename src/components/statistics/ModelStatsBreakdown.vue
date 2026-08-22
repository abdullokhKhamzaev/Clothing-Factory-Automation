<script setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";

// getStats() natijasini (stats, statsByUser, userStats, statsByModel)
// "Mahsulot bo'yicha" / "Xodim bo'yicha" ko'rinishlarida chizadi
defineProps({
  modelsStats: {
    type: Object,
    required: true,
  },
});

const viewByUser = ref(false);
const { t } = useI18n();
</script>

<template>
  <q-card-section class="q-pa-sm">
    <div class="row q-px-sm q-gutter-x-sm">
      <q-btn
        @click="viewByUser = false"
        :color="!viewByUser ? 'primary' : 'grey-5'"
        :text-color="!viewByUser ? 'white' : 'grey-7'"
        :unelevated="!viewByUser"
        :outline="viewByUser"
        icon="inventory"
        :label="t('statistics.modelView')"
        class="q-px-md"
        dense
        no-caps
      />
      <q-btn
        @click="viewByUser = true"
        :color="viewByUser ? 'primary' : 'grey-5'"
        :text-color="viewByUser ? 'white' : 'grey-7'"
        :unelevated="viewByUser"
        :outline="!viewByUser"
        icon="people"
        dense
        no-caps
        :label="t('statistics.userView')"
        class="q-px-md"
      />
    </div>
  </q-card-section>

  <q-separator />

  <q-expansion-item
    expand-separator
    :label="t('statistics.additionalInfo')"
    header-class="text-primary"
  >
    <q-card>

      <!-- Product View (Default) -->
      <div v-if="!viewByUser">
        <div v-for="(count, modelName) in modelsStats.stats" :key="modelName">
          <q-expansion-item
            :label="`${modelName} (${t('statistics.total')}: ${count})`"
            icon="inventory"
            header-class="text-secondary text-weight-medium"
          >
            <q-card class="q-ml-md">
              <div v-for="(userCount, userName) in modelsStats.statsByUser[modelName]" :key="userName">
                <div class="row justify-between items-center wrap q-px-md q-py-sm">
                  <div>
                    <q-icon name="person" class="q-mr-sm" color="primary" />
                    {{ userName }}
                  </div>
                  <div class="text-bold text-green">
                    {{ userCount }}
                  </div>
                </div>
                <q-separator inset="item" />
              </div>
            </q-card>
          </q-expansion-item>
          <q-separator />
        </div>
      </div>

      <!-- User View -->
      <div v-else>
        <div v-for="(count, userName) in modelsStats.userStats" :key="userName">
          <q-expansion-item
            :label="`${userName} (${t('statistics.total')}: ${count})`"
            icon="person"
            header-class="text-secondary text-weight-medium"
          >
            <q-card class="q-ml-md">
              <div v-for="(modelCount, modelName) in modelsStats.statsByModel[userName]" :key="modelName">
                <div class="row justify-between items-center wrap q-px-md q-py-sm">
                  <div>
                    <q-icon name="inventory" class="q-mr-sm" color="secondary" />
                    {{ modelName }}
                  </div>
                  <div class="text-bold text-orange">
                    {{ modelCount }}
                  </div>
                </div>
                <q-separator inset="item" />
              </div>
            </q-card>
          </q-expansion-item>
          <q-separator />
        </div>
      </div>
    </q-card>
  </q-expansion-item>
</template>
