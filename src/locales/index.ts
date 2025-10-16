import type { AccessibilityMessages, LocaleCode, AccessibilityLocaleMessages } from './types'
import { es } from './es'
import { en } from './en'

export type { AccessibilityMessages, LocaleCode, AccessibilityLocaleMessages }

export const messages: AccessibilityLocaleMessages = {
  es,
  en
}

export const defaultLocale: LocaleCode = 'es'

export const availableLocales: { code: LocaleCode; name: string; flag: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

// Mapeo de códigos de idioma para Text-to-Speech
export const ttsLangMap: Record<LocaleCode, string> = {
  es: 'es-MX',
  en: 'en-US'
}
