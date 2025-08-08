import { ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable for managing theme (light/dark mode) with localStorage persistence
 * @returns {object} Object containing isDark ref and theme management functions
 */
export function useTheme() {
  const $q = useQuasar()
  
  // Initialize theme from localStorage or default to false (light mode)
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme !== null) {
      return savedTheme === 'dark'
    }
    // Fallback to system preference or default to light mode
    return $q.dark.isActive || false
  }

  const isDark = ref(getInitialTheme())

  // Apply theme on mount
  onMounted(() => {
    $q.dark.set(isDark.value)
  })

  // Watch for theme changes and persist to localStorage
  watch(isDark, (newValue) => {
    $q.dark.set(newValue)
    localStorage.setItem('theme', newValue ? 'dark' : 'light')
  })

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  /**
   * Set theme explicitly
   * @param {boolean} darkMode - true for dark mode, false for light mode
   */
  const setTheme = (darkMode) => {
    isDark.value = darkMode
  }

  /**
   * Get current theme as string
   * @returns {string} 'dark' or 'light'
   */
  const getCurrentTheme = () => {
    return isDark.value ? 'dark' : 'light'
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
    getCurrentTheme
  }
}
