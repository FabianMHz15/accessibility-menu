import type { App } from 'vue'

import AccessibilityMenu from './components/AccessibilityMenu.vue'
import { useAccessibility } from './composables/useAccessibility'
import { useI18n } from './composables/useI18n'
import './assets/accessibility.css'

// Plugin de Vue para instalar globalmente
export const AccessibilityMenuPlugin = {
  install(app: App) {
    app.component('AccessibilityMenu', AccessibilityMenu)
  }
}

// Exportaciones individuales
export { AccessibilityMenu, useAccessibility, useI18n }

// Exportar tipos de i18n
export type {
  AccessibilityMessages,
  LocaleCode,
  AccessibilityLocaleMessages
} from './locales/types'

// Exportar configuración de i18n
export {
  messages,
  defaultLocale,
  availableLocales,
  ttsLangMap
} from './locales'

// Exportar tipos de configuración
export type {
  AccessibilityColorConfig,
  AccessibilityConfig,
  ThemeMode
} from './composables/useAccessibility'

export type { UseI18nOptions } from './composables/useI18n'

// Exportación por defecto
export default AccessibilityMenuPlugin