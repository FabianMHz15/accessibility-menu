import type { App } from 'vue'

import AccessibilityMenu from './components/AccessibilityMenu.vue'
import { useAccessibility } from './composables/useAccessibility'
import './assets/accessibility.css'

// Plugin de Vue para instalar globalmente
export const AccessibilityMenuPlugin = {
  install(app: App) {
    app.component('AccessibilityMenu', AccessibilityMenu)
  }
}

// Exportaciones individuales
export { AccessibilityMenu, useAccessibility }

// Exportación por defecto
export default AccessibilityMenuPlugin