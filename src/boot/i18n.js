import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export default defineBoot(({ app }) => {
  // Check if the language is stored in localStorage
  const storedLang = localStorage.getItem('lang') || 'uz'

  // Create the i18n instance with the stored language
  const i18n = createI18n({
    locale: storedLang,
    globalInjection: true,
    messages
  })

  // Set i18n instance on app
  app.use(i18n)

  // Update language in localStorage whenever it's changed
  i18n.global.setLocaleMessage = (locale) => {
    localStorage.setItem('lang', locale)
  }
})
