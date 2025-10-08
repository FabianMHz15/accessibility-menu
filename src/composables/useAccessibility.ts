import { ref, computed } from "vue"

export interface AccessibilityColorConfig {
  primaryColor?: string
  primaryHoverColor?: string
  linkHighlightBg?: string
  linkHighlightBorder?: string
  readingHighlightBg?: string
  readingHighlightBorder?: string
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

export const useAccessibility = (colorConfig?: AccessibilityColorConfig) => {
    const fontSize = ref(100)
    const isDyslexicFont = ref(false)
    const isHighContrast = ref(false)
    const isHighlightLinks = ref(false)
    const readOnHover = ref(false)
    const readOnSelect = ref(false)

    // Aplicar configuración de colores si se proporciona
    if (colorConfig) {
      colors.value = { ...defaultColors, ...colorConfig }
      applyColors(colors.value)
    }

    const config = computed(() => ({
      fontSize: fontSize.value,
      isDyslexicFont: isDyslexicFont.value,
      isHighContrast: isHighContrast.value,
      isHighlightLinks: isHighlightLinks.value,
      readOnHover: readOnHover.value,
      readOnSelect: readOnSelect.value,
      colors: colors.value
    }))

    return {
      fontSize,
      isDyslexicFont,
      isHighContrast,
      isHighlightLinks,
      readOnHover,
      readOnSelect,
      config,
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