import { ref, computed } from "vue"
import type { LocaleCode, AccessibilityMessages } from '../locales/types'

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface AccessibilityColorConfig {
  primaryColor?: string
  primaryHoverColor?: string
  linkHighlightBg?: string
  linkHighlightBorder?: string
  readingHighlightBg?: string
  readingHighlightBorder?: string
}

export interface AccessibilityConfig {
  colors?: AccessibilityColorConfig
  locale?: LocaleCode
  messages?: Partial<Record<LocaleCode, Partial<AccessibilityMessages>>>
  useGlobalI18n?: boolean
  theme?: ThemeMode
}

const defaultColors: Required<AccessibilityColorConfig> = {
  primaryColor: '#2563eb',
  primaryHoverColor: '#1d4ed8',
  linkHighlightBg: '#fef08a',
  linkHighlightBorder: '#eab308',
  readingHighlightBg: '#bfdbfe',
  readingHighlightBorder: '#3b82f6'
}

// Estado global para colores
const colors = ref<Required<AccessibilityColorConfig>>({ ...defaultColors })

export const useAccessibility = (config?: AccessibilityConfig) => {
    const fontSize = ref(100)
    const isDyslexicFont = ref(false)
    const isHighContrast = ref(false)
    const isHighlightLinks = ref(false)
    const readOnHover = ref(false)
    const readOnSelect = ref(false)

    // Aplicar configuración de colores si se proporciona
    if (config?.colors) {
      colors.value = { ...defaultColors, ...config.colors }
      applyColors(colors.value)
    }

    const accessibilityConfig = computed(() => ({
      fontSize: fontSize.value,
      isDyslexicFont: isDyslexicFont.value,
      isHighContrast: isHighContrast.value,
      isHighlightLinks: isHighlightLinks.value,
      readOnHover: readOnHover.value,
      readOnSelect: readOnSelect.value,
      colors: colors.value,
      locale: config?.locale,
      messages: config?.messages,
      useGlobalI18n: config?.useGlobalI18n,
      theme: config?.theme
    }))

    return {
      fontSize,
      isDyslexicFont,
      isHighContrast,
      isHighlightLinks,
      readOnHover,
      readOnSelect,
      config: accessibilityConfig,
      colors
    }
}

// Función para aplicar colores mediante CSS custom properties
function applyColors(colorConfig: Required<AccessibilityColorConfig>) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.setProperty('--accessibility-primary', colorConfig.primaryColor)
  root.style.setProperty('--accessibility-primary-hover', colorConfig.primaryHoverColor)
  root.style.setProperty('--accessibility-link-highlight-bg', colorConfig.linkHighlightBg)
  root.style.setProperty('--accessibility-link-highlight-border', colorConfig.linkHighlightBorder)
  root.style.setProperty('--accessibility-reading-highlight-bg', colorConfig.readingHighlightBg)
  root.style.setProperty('--accessibility-reading-highlight-border', colorConfig.readingHighlightBorder)
}