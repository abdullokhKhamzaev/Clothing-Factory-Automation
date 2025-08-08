<template>
  <q-item
    clickable
    :to="props.to"
    class="flex"
    :active-class="$q.dark.isActive ? 'bg-grey text-white' : 'bg-primary text-white'"
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
      <q-item-label class="text-subtitle1">
        {{ $t(`menus.${menuRoute}.${props.title}`) }}
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
  icon: {
    type: String,
    default: ''
  },
  menuRoute: {
    type: String,
    default: 'sideBar'
  }
})
</script>
