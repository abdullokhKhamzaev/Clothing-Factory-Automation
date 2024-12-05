<template>
  <q-item
    clickable
    :to="props.to"
    class="flex"
  >
    <q-item-section
      v-if="props.icon"
      style="max-width: 24px"
    >
      <q-icon
        :name="props.icon"
        size="sm"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-subtitle1 text-blue-grey-10">
        {{ props.title }}
      </q-item-label>
      <q-item-label
        v-if="props.caption"
        caption
      >
        {{ props.caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },

  caption: {
    type: String,
    default: ''
  },

  link: {
    type: String,
    default: '#'
  },

  icon: {
    type: String,
    default: ''
  }
})
</script>
