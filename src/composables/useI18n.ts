import { ref, computed, getCurrentInstance } from 'vue'
import type { AccessibilityMessages, LocaleCode } from '../locales/types'
import { messages, defaultLocale, ttsLangMap } from '../locales'

// Estado global para el idioma
const currentLocale = ref<LocaleCode>(defaultLocale)
const customMessages = ref<Partial<Record<LocaleCode, Partial<AccessibilityMessages>>>>({})

// Inicializar desde localStorage
if (typeof window !== 'undefined') {
  const savedLocale = localStorage.getItem('accessibility-locale') as LocaleCode
  if (savedLocale && (savedLocale === 'es' || savedLocale === 'en')) {
    currentLocale.value = savedLocale
  }
}

export interface UseI18nOptions {
  locale?: LocaleCode
  messages?: Partial<Record<LocaleCode, Partial<AccessibilityMessages>>>
  useGlobalI18n?: boolean
}

export const useI18n = (options?: UseI18nOptions) => {
  const instance = getCurrentInstance()

  // Intentar detectar vue-i18n global
  const globalI18n = options?.useGlobalI18n !== false && instance?.appContext.config.globalProperties.$i18n

  // Si se proporciona un locale en las opciones, usarlo
  if (options?.locale) {
    currentLocale.value = options.locale
  }

  // Si se proporcionan mensajes personalizados, guardarlos
  if (options?.messages) {
    customMessages.value = {
      ...customMessages.value,
      ...options.messages
    }
  }

  // Función para obtener un mensaje traducido
  const t = (key: keyof AccessibilityMessages): string => {
    // Si existe vue-i18n global y tiene la key, usarlo
    if (globalI18n && globalI18n.t) {
      const globalKey = `accessibility.${key}`
      const translated = globalI18n.t(globalKey)
      // Si la traducción no es la misma que la key (no encontrada), usarla
      if (translated !== globalKey) {
        return translated
      }
    }

    // Usar mensajes personalizados si existen
    const customMsg = customMessages.value[currentLocale.value]?.[key]
    if (customMsg) {
      return customMsg
    }

    // Usar mensajes por defecto
    return messages[currentLocale.value][key] || messages[defaultLocale][key] || key
  }

  // Función para cambiar el idioma
  const setLocale = (locale: LocaleCode) => {
    currentLocale.value = locale
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-locale', locale)
    }
  }

  // Obtener el idioma para TTS
  const ttsLang = computed(() => ttsLangMap[currentLocale.value] || ttsLangMap[defaultLocale])

  return {
    locale: computed(() => currentLocale.value),
    t,
    setLocale,
    ttsLang
  }
}
