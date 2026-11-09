import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

// Check if the language is stored in localStorage
const storedLang = localStorage.getItem('lang') || 'uz'

// Instansiya modul darajasida: store'lar (masalan chat) ham tarjimalardan
// foydalana olishi uchun eksport qilinadi
export const i18n = createI18n({
  locale: storedLang,
  globalInjection: true,
  messages
})

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)

  // Update language in localStorage whenever it's changed
  i18n.global.setLocaleMessage = (locale) => {
    localStorage.setItem('lang', locale)
  }
})
