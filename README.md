# accessibility-menu

🌐 Componente de accesibilidad universal  para **Vue 3**, **Nuxt 4** y **Laravel + Vite**

## ✨ Características

- 📏 Control de tamaño de fuente (80% - 200%)
- 🔤 Fuente OpenDyslexic para dislexia
- ☀️ Alto contraste
- 🔗 Resaltado de enlaces
- 🔊 Lector de pantalla (TTS)
- 🖱️ Lectura al pasar mouse
- ✍️ Lectura de texto seleccionado
- 🌍 **Soporte multiidioma (i18n)** - Español e Inglés
- 🎨 Personalización de colores
- 🌓 **Control de tema (claro/oscuro/auto)**
- 💾 Persistencia en localStorage
- ⚡ Compatible con Vue 3, Nuxt 4 y Laravel
- ♿ Cumple con WCAG 2.1 AA

## 📦 Instalación

```bash
npm install accessibility-menu
```

## 1️⃣ Vue 3 + Vite

```js
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import AccessibilityMenuPlugin from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'

const app = createApp(App)
app.use(AccessibilityMenuPlugin)
app.mount('#app')
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


export default defineConfig({
  plugins: [
    vue(),
  ]
})

<!-- App.vue -->
<template>
  
    <h1>Mi Aplicación</h1>
    <AccessibilityMenu />
  
</template>
```
## 2️⃣ Nuxt 3

```js

// plugins/accessibility.client.ts
import AccessibilityMenuPlugin from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(AccessibilityMenuPlugin)
})
```
```js
<!-- app.vue -->
<template>
  <UApp>
    <NuxtPage />
    <AccessibilityMenu />
  </UApp>
</template>
```
## 3️⃣ Laravel + Vite
```js
Sigue la guía de instalación de Nuxt UI para Laravel:
// resources/js/app.ts
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import AccessibilityMenuPlugin from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(AccessibilityMenuPlugin)
      .mount(el)
  },
})
```
```js
// vite.config.ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'


export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.ts'],
      refresh: true,
    }),
    vue(),

  ],
})
```
```js
<!-- resources/js/Layouts/AppLayout.vue -->
<template>
  <UApp>
    <nav>...</nav>
    <slot />
    <AccessibilityMenu />
  </UApp>
</template>
```
### 4️⃣ Importación Individual

```js
<script setup>
import { AccessibilityMenu } from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'
</script>

<template>
  <UApp>
    <AccessibilityMenu />
  </UApp>
</template>
```
### 5️⃣ Usar el Composable

```js
<script setup>
import { useAccessibility } from 'accessibility-menu'
const { fontSize, isDyslexicFont, config } = useAccessibility()
console.log('Configuración:', config.value)
</script>
```

## 🎨 Control de Tema (Claro/Oscuro)

El componente soporta tres modos de tema:

- **`auto`** (por defecto): Detecta automáticamente las preferencias del sistema del usuario
- **`light`**: Forzar tema claro
- **`dark`**: Forzar tema oscuro

### Ejemplo de Uso

```vue
<template>
  <!-- Tema automático (por defecto) -->
  <AccessibilityMenu />

  <!-- Forzar tema claro -->
  <AccessibilityMenu theme="light" />

  <!-- Forzar tema oscuro -->
  <AccessibilityMenu theme="dark" />
</template>
```

### Con TypeScript

```typescript
import { AccessibilityMenu, type ThemeMode } from 'accessibility-menu'

const theme: ThemeMode = 'dark'
```

## 🎨 Personalización de Colores

Puedes personalizar los colores del componente pasando una configuración de colores:

### Opción 1: Mediante Props en el Componente

```vue
<script setup>
import { AccessibilityMenu } from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'

const customColors = {
  primaryColor: '#7c3aed',        // Color principal (botón flotante, toggles)
  primaryHoverColor: '#6d28d9',   // Color hover del botón principal
  linkHighlightBg: '#fde68a',     // Fondo del resaltado de enlaces
  linkHighlightBorder: '#f59e0b', // Borde del resaltado de enlaces
  readingHighlightBg: '#ddd6fe',  // Fondo cuando se lee texto
  readingHighlightBorder: '#8b5cf6' // Borde cuando se lee texto
}
</script>

<template>
  <AccessibilityMenu :colors="customColors" />
</template>
```

### Opción 2: Mediante el Composable

```vue
<script setup>
import { useAccessibility } from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'

// Configurar colores al inicializar
useAccessibility({
  primaryColor: '#0056b3',
  primaryHoverColor: '#0252A6',
  linkHighlightBg: '#fde68a',
  linkHighlightBorder: '#f59e0b',
  readingHighlightBg: '#ddd6fe',
  readingHighlightBorder: '#8b5cf6'
})
</script>
```

### Colores Configurables

| Propiedad | Descripción | Valor por defecto |
|-----------|-------------|-------------------|
| `primaryColor` | Color principal del botón flotante y elementos activos | `#2563eb` (blue-600) |
| `primaryHoverColor` | Color hover del botón principal | `#1d4ed8` (blue-700) |
| `linkHighlightBg` | Fondo del resaltado de enlaces | `#fef08a` (yellow-200) |
| `linkHighlightBorder` | Borde del resaltado de enlaces | `#eab308` (yellow-500) |
| `readingHighlightBg` | Fondo cuando se lee texto (TTS) | `#bfdbfe` (blue-200) |
| `readingHighlightBorder` | Borde cuando se lee texto (TTS) | `#3b82f6` (blue-500) |

**Nota:** Todos los colores son opcionales. Si no se especifica un color, se usará el valor por defecto.

## 🌍 Internacionalización (i18n)

El componente incluye soporte multiidioma con Español e Inglés por defecto. El usuario puede cambiar el idioma directamente desde el menú de accesibilidad.

### Idiomas Disponibles

- 🇪🇸 Español (es) - Idioma por defecto
- 🇺🇸 Inglés (en)

### Configurar el Idioma Inicial

#### Opción 1: Mediante Props en el Componente

```vue
<template>
  <AccessibilityMenu locale="en" />
</template>
```

#### Opción 2: Mediante el Composable

```vue
<script setup>
import { useAccessibility } from 'accessibility-menu'

useAccessibility({
  locale: 'en'
})
</script>
```

### Integración con Vue I18n

Si tu proyecto ya usa `vue-i18n`, el componente lo detectará automáticamente y buscará las traducciones en la ruta `accessibility.*`. Si no las encuentra, usará sus traducciones internas.

#### Ejemplo con Vue I18n existente:

```js
// i18n.js
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'es',
  messages: {
    es: {
      accessibility: {
        title: 'Accesibilidad Personalizada',
        subtitle: 'Personaliza tu experiencia',
        // ... más traducciones
      }
    },
    en: {
      accessibility: {
        title: 'Custom Accessibility',
        subtitle: 'Customize your experience',
        // ... más traducciones
      }
    }
  }
})

export default i18n
```

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import AccessibilityMenuPlugin from 'accessibility-menu'
import 'accessibility-menu/dist/accessibility-menu.css'

createApp(App)
  .use(i18n)
  .use(AccessibilityMenuPlugin)
  .mount('#app')
```

### Personalizar Traducciones

Puedes sobrescribir traducciones específicas sin necesidad de vue-i18n:

```vue
<script setup>
import { AccessibilityMenu } from 'accessibility-menu'

const customMessages = {
  es: {
    title: 'Herramientas de Accesibilidad',
    subtitle: 'Ajusta según tus preferencias'
  },
  en: {
    title: 'Accessibility Tools',
    subtitle: 'Adjust to your preferences'
  }
}
</script>

<template>
  <AccessibilityMenu :messages="customMessages" />
</template>
```

### Deshabilitar Integración con Vue I18n

Si tu proyecto usa vue-i18n pero prefieres que el componente use sus traducciones internas:

```vue
<template>
  <AccessibilityMenu :use-global-i18n="false" />
</template>
```

### Keys de Traducción Disponibles

```typescript
interface AccessibilityMessages {
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
```

### Text-to-Speech por Idioma

El TTS (Text-to-Speech) se configura automáticamente según el idioma seleccionado:

- Español: `es-MX`
- Inglés: `en-US`

## 📋 Requisitos

- Vue 3.x
- Node.js 18+

## 🎯 Compatibilidad

| Framework | Versión | Compatible |
|-----------|---------|-----------|
| Vue 3 | ^3.0.0 | ✅ |
| Nuxt 4 | ^4.0.0 | ✅ |
| Laravel + Vite | 10.x+ | ✅ |

## 📄 Licencia

MIT © Fabián Márquez