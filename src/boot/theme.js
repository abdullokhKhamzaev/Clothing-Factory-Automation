import { boot } from 'quasar/wrappers'

/**
 * Boot plugin to initialize theme from localStorage
 * This ensures the theme is applied before the app renders
 */
export default boot(({ app }) => {
  // Initialize theme from localStorage on app startup
  const savedTheme = localStorage.getItem('theme')
  
  if (savedTheme) {
    // Apply theme immediately to prevent flash
    app.config.globalProperties.$q.dark.set(savedTheme === 'dark')
  }
})
