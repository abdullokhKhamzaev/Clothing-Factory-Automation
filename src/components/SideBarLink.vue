<template>
  <q-item
    clickable
    :to="props.to"
    class="modern-nav-item"
    :class="{ 'modern-nav-item--active': isActive }"
    v-ripple
  >
    <q-item-section
      v-if="props.icon"
      avatar
      class="q-pr-sm"
      style="min-width: 32px;"
    >
      <q-icon
        :name="props.icon"
        size="20px"
        :class="isActive ? 'text-primary' : ($q.dark.isActive ? 'text-grey-3' : 'text-grey-9')"
      />
    </q-item-section>

    <q-item-section class="modern-nav-content">
      <q-item-label :class="isActive ? 'nav-label text-primary text-weight-medium' : `nav-label ${$q.dark.isActive ? 'text-grey-3' : 'text-grey-9'}`">
        {{ $t(`menus.${menuRoute}.${props.title}`) }}
      </q-item-label>
      <q-item-label
        v-if="props.caption"
        caption
        class="nav-caption"
      >
        {{ props.caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
  },
  routePrefix: {
    type: String,
    default: ''
  }
})

// Check if current route matches or starts with the routePrefix
const isActive = computed(() => {
  const currentPath = route.path
  const targetPath = typeof props.to === 'object' ? route.resolve(props.to).path : props.to
  
  // If exact match
  if (currentPath === targetPath) {
    return true
  }
  
  // If routePrefix is provided, check if current path starts with it
  if (props.routePrefix) {
    return currentPath.includes(props.routePrefix)
  }
  
  return false
})
</script>

<style lang="scss" scoped>
.modern-nav-item {
  border-radius: 12px;
  margin: 4px 8px;
  padding: 12px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: var(--q-primary);
    border-radius: 0 4px 4px 0;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: rgba(var(--q-primary-rgb), 0.08);
    
  }
  
  &--active {
    background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.15) 0%, rgba(var(--q-primary-rgb), 0.08) 100%);
    border: 1px solid rgba(var(--q-primary-rgb), 0.2);
    
    &:before {
      transform: scaleX(1);
    }
  }
  
  
  .modern-nav-content {
    .nav-label {
      font-size: 14px;
      transition: all 0.3s ease;
      letter-spacing: 0.25px;
    }
    
    .nav-caption {
      font-size: 12px;
      color: var(--q-grey-6);
      margin-top: 2px;
    }
  }
}

// Dark mode styles
.body--dark {
  .modern-nav-item {
    &:hover {
      background: rgba(var(--q-primary-rgb), 0.15);
    }
    
    &--active {
      background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.2) 0%, rgba(var(--q-primary-rgb), 0.12) 100%);
      border: 1px solid rgba(var(--q-primary-rgb), 0.3);
    }
    
    .modern-nav-content {
      
      .nav-caption {
        color: var(--q-grey-5);
      }
    }
  }
}
</style>
