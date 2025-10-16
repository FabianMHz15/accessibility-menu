export interface AccessibilityMessages {
  // Header
  title: string
  subtitle: string
  close: string

  // Font Size
  fontSize: string
  increaseFontSize: string
  decreaseFontSize: string
  resetFontSize: string

  // Features
  dyslexicFont: string
  highContrast: string
  highlightLinks: string

  // Screen Reader
  screenReader: string
  readFullPage: string
  stopReading: string

  // Reading Modes
  readOnHover: string
  readOnHoverDesc: string
  readOnSelect: string
  readOnSelectDesc: string

  // Actions
  resetAll: string

  // Info
  infoTitle: string
  infoText: string

  // Language
  language: string

  // Alerts
  speechNotSupported: string

  // Aria Labels
  ariaOpenMenu: string
  ariaCloseMenu: string
  ariaToggleDyslexic: string
  ariaToggleContrast: string
  ariaToggleLinks: string
  ariaToggleHover: string
  ariaToggleSelect: string
}

export type LocaleCode = 'es' | 'en'

export type AccessibilityLocaleMessages = {
  [key in LocaleCode]: AccessibilityMessages
}
