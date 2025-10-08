# accessibility-menu

🌐 Componente de accesibilidad universal  para **Vue 3**, **Nuxt 4** y **Laravel + Vite**

## ✨ Características

- 📏 Control de tamaño de fuente (80% - 150%)
- 🔤 Fuente OpenDyslexic para dislexia
- ☀️ Alto contraste
- 🔗 Resaltado de enlaces
- 🔊 Lector de pantalla (TTS)
- 🖱️ Lectura al pasar mouse
- ✍️ Lectura de texto seleccionado
- 💾 Persistencia en localStorage
- ⚡ Compatible con Vue 3, Nuxt 3 y Laravel

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
```
```js
<!-- App.vue -->
<template>
  
    <h1>Mi Aplicación</h1>
    <AccessibilityMenu />
  
</template>
2️⃣ Nuxt 3

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
  primaryColor: '#7c3aed',
  primaryHoverColor: '#6d28d9',
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

### 📋 Requisitos
- Vue 3.x
- Nuxt UI 2.x (se instala automáticamente como peer dependency)
- Node.js 18+
- 🎯 Compatibilidad
- Framework	Versión	Compatible
- Vue 3	^3.0.0	✅
- Nuxt 3	^3.0.0	✅
- Laravel + Vite	10.x+	✅
- 📄 Licencia
- MIT © Fabián Márquez