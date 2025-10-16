<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import type { AccessibilityColorConfig, ThemeMode } from '../composables/useAccessibility';
import type { LocaleCode, AccessibilityMessages } from '../locales/types';
import { useI18n } from '../composables/useI18n';
import { availableLocales } from '../locales';

// Props para configuración de colores, i18n y tema
const props = withDefaults(defineProps<{
  colors?: AccessibilityColorConfig
  locale?: LocaleCode
  messages?: Partial<Record<LocaleCode, Partial<AccessibilityMessages>>>
  useGlobalI18n?: boolean
  theme?: ThemeMode
}>(), {
  theme: 'auto'
});

// Inicializar i18n
const { t, ttsLang, locale, setLocale } = useI18n({
  locale: props.locale,
  messages: props.messages,
  useGlobalI18n: props.useGlobalI18n
});

// Clases dinámicas del tema
const themeClass = computed(() => {
  if (props.theme === 'light') return 'theme-light';
  if (props.theme === 'dark') return 'theme-dark';
  return 'theme-auto'; // auto
});

// Estado del menú
const isOpen = ref(false);
const isReading = ref(false);
const readOnHover = ref(false);
const readOnSelect = ref(false);
const speechSynthesis = ref<SpeechSynthesis | null>(null);
const currentUtterance = ref<SpeechSynthesisUtterance | null>(null);
const currentReadingElement = ref<HTMLElement | null>(null);

// Configuración de accesibilidad
const fontSize = ref(100);
const isDyslexicFont = ref(false);
const isHighContrast = ref(false);
const isHighlightLinks = ref(false);

// Aplicar colores personalizados
const applyCustomColors = () => {
    if (typeof document === 'undefined' || !props.colors) return;

    const root = document.documentElement;
    const defaultColors = {
        primaryColor: '#2563eb',
        primaryHoverColor: '#1d4ed8',
        linkHighlightBg: '#fef08a',
        linkHighlightBorder: '#eab308',
        readingHighlightBg: '#bfdbfe',
        readingHighlightBorder: '#3b82f6'
    };

    const colors = { ...defaultColors, ...props.colors };

    root.style.setProperty('--accessibility-primary', colors.primaryColor);
    root.style.setProperty('--accessibility-primary-hover', colors.primaryHoverColor);
    root.style.setProperty('--accessibility-link-highlight-bg', colors.linkHighlightBg);
    root.style.setProperty('--accessibility-link-highlight-border', colors.linkHighlightBorder);
    root.style.setProperty('--accessibility-reading-highlight-bg', colors.readingHighlightBg);
    root.style.setProperty('--accessibility-reading-highlight-border', colors.readingHighlightBorder);
};

// Cargar configuración desde localStorage
onMounted(() => {
    if (typeof window !== 'undefined') {
        speechSynthesis.value = window.speechSynthesis;

        // Aplicar colores personalizados
        applyCustomColors();

        // Cargar configuración guardada
        const savedFontSize = localStorage.getItem('accessibility-font-size');
        const savedDyslexicFont = localStorage.getItem('accessibility-dyslexic-font');
        const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
        const savedHighlightLinks = localStorage.getItem('accessibility-highlight-links');
        const savedReadOnHover = localStorage.getItem('accessibility-read-on-hover');
        const savedReadOnSelect = localStorage.getItem('accessibility-read-on-select');

        if (savedFontSize) {
            const parsedSize = parseInt(savedFontSize);
            // Validar el valor cargado del localStorage
            fontSize.value = Math.min(Math.max(parsedSize, 80), 200);
        }
        if (savedDyslexicFont) isDyslexicFont.value = savedDyslexicFont === 'true';
        if (savedHighContrast) isHighContrast.value = savedHighContrast === 'true';
        if (savedHighlightLinks) isHighlightLinks.value = savedHighlightLinks === 'true';
        if (savedReadOnHover) readOnHover.value = savedReadOnHover === 'true';
        if (savedReadOnSelect) readOnSelect.value = savedReadOnSelect === 'true';

        applySettings();

        // Configurar eventos de lectura
        if (readOnHover.value) enableReadOnHover();
        if (readOnSelect.value) enableReadOnSelect();
    }
});

// Limpiar eventos al desmontar
onUnmounted(() => {
    disableReadOnHover();
    disableReadOnSelect();
    stopReading();
});

// Aplicar configuración
const applySettings = () => {
    if (typeof document === 'undefined') return;

    document.documentElement.style.fontSize = `${fontSize.value}%`;

    if (isDyslexicFont.value) {
        document.documentElement.classList.add('dyslexic-font');
    } else {
        document.documentElement.classList.remove('dyslexic-font');
    }

    if (isHighContrast.value) {
        document.documentElement.classList.add('high-contrast');
    } else {
        document.documentElement.classList.remove('high-contrast');
    }

    if (isHighlightLinks.value) {
        document.documentElement.classList.add('highlight-links');
    } else {
        document.documentElement.classList.remove('highlight-links');
    }
};

// Watchers para guardar cambios
watch(fontSize, (newValue) => {
    // Validar que el fontSize esté dentro del rango permitido
    if (newValue < 80) {
        fontSize.value = 80;
        return;
    }
    if (newValue > 200) {
        fontSize.value = 200;
        return;
    }
    localStorage.setItem('accessibility-font-size', newValue.toString());
    applySettings();
});

watch(isDyslexicFont, (newValue) => {
    localStorage.setItem('accessibility-dyslexic-font', newValue.toString());
    applySettings();
});

watch(isHighContrast, (newValue) => {
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
    applySettings();
});

watch(isHighlightLinks, (newValue) => {
    localStorage.setItem('accessibility-highlight-links', newValue.toString());
    applySettings();
});

watch(readOnHover, (newValue) => {
    localStorage.setItem('accessibility-read-on-hover', newValue.toString());
    if (newValue) {
        enableReadOnHover();
    } else {
        disableReadOnHover();
    }
});

watch(readOnSelect, (newValue) => {
    localStorage.setItem('accessibility-read-on-select', newValue.toString());
    if (newValue) {
        enableReadOnSelect();
    } else {
        disableReadOnSelect();
    }
});

// Funciones de control
const increaseFontSize = () => {
    if (fontSize.value < 200) fontSize.value += 10;
};

const decreaseFontSize = () => {
    if (fontSize.value > 80) fontSize.value -= 10;
};

const resetFontSize = () => {
    fontSize.value = 100;
};

// Lector de pantalla
const toggleReading = () => {
    if (!speechSynthesis.value) {
        alert(t('speechNotSupported'));
        return;
    }

    if (isReading.value) {
        stopReading();
    } else {
        startReading();
    }
};

const startReading = () => {
    if (!speechSynthesis.value) return;

    const content = document.body.innerText;

    currentUtterance.value = new SpeechSynthesisUtterance(content);
    currentUtterance.value.lang = ttsLang.value;
    currentUtterance.value.rate = 1.0;
    currentUtterance.value.pitch = 1.0;

    currentUtterance.value.onend = () => {
        isReading.value = false;
    };

    speechSynthesis.value.speak(currentUtterance.value);
    isReading.value = true;
};

const stopReading = () => {
    if (speechSynthesis.value) {
        speechSynthesis.value.cancel();
        isReading.value = false;
    }
    if (currentReadingElement.value) {
        currentReadingElement.value.classList.remove('reading-highlight');
        currentReadingElement.value = null;
    }
};

// Leer texto específico
const speakText = (text: string, element?: HTMLElement) => {
    if (!speechSynthesis.value) return;

    speechSynthesis.value.cancel();

    if (currentReadingElement.value) {
        currentReadingElement.value.classList.remove('reading-highlight');
    }

    if (element) {
        element.classList.add('reading-highlight');
        currentReadingElement.value = element;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLang.value;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
        if (currentReadingElement.value) {
            currentReadingElement.value.classList.remove('reading-highlight');
            currentReadingElement.value = null;
        }
    };

    speechSynthesis.value.speak(utterance);
};

// Lectura al pasar el mouse
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const handleMouseOver = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.closest('.accessibility-menu')) return;

    if (hoverTimeout) clearTimeout(hoverTimeout);

    hoverTimeout = setTimeout(() => {
        const text = target.innerText?.trim() || target.textContent?.trim();
        if (text && text.length > 0 && text.length < 500) {
            speakText(text, target);
        }
    }, 500);
};

const handleMouseOut = () => {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
};

const enableReadOnHover = () => {
    if (typeof document === 'undefined') return;
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
};

const disableReadOnHover = () => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    if (hoverTimeout) clearTimeout(hoverTimeout);
};

// Lectura de texto seleccionado
const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const container = range?.commonAncestorContainer;
        const element = container?.nodeType === 1
            ? container as HTMLElement
            : container?.parentElement;

        if (element) {
            speakText(text, element);
        }
    }
};

const enableReadOnSelect = () => {
    if (typeof document === 'undefined') return;
    document.addEventListener('mouseup', handleSelection);
};

const disableReadOnSelect = () => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('mouseup', handleSelection);
};

const resetAll = () => {
    fontSize.value = 100;
    isDyslexicFont.value = false;
    isHighContrast.value = false;
    isHighlightLinks.value = false;
    readOnHover.value = false;
    readOnSelect.value = false;
    stopReading();
    disableReadOnHover();
    disableReadOnSelect();

    localStorage.removeItem('accessibility-font-size');
    localStorage.removeItem('accessibility-dyslexic-font');
    localStorage.removeItem('accessibility-high-contrast');
    localStorage.removeItem('accessibility-highlight-links');
    localStorage.removeItem('accessibility-read-on-hover');
    localStorage.removeItem('accessibility-read-on-select');
};

// Cerrar el menú al hacer clic fuera
const closeOnOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.accessibility-panel') && !target.closest('.accessibility-button')) {
        isOpen.value = false;
    }
};

watch(isOpen, (newValue) => {
    if (newValue) {
        document.addEventListener('click', closeOnOutsideClick);
    } else {
        document.removeEventListener('click', closeOnOutsideClick);
    }
});
</script>

<template>
    <div class="accessibility-menu">
        <!-- Botón Flotante -->
        <button
            @click="isOpen = true"
            class="accessibility-button"
            :aria-label="t('ariaOpenMenu')"
            aria-expanded="false"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </button>

        <!-- Overlay -->
        <transition name="overlay">
            <div
                v-if="isOpen"
                class="overlay"
                @click="isOpen = false"
            ></div>
        </transition>

        <!-- Panel Lateral -->
        <transition name="panel">
            <div
                v-if="isOpen"
                :class="['accessibility-panel', themeClass]"
            >
                <!-- Header -->
                <div class="panel-header">
                    <div class="header-content">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="header-icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                            <h2 class="header-title">{{ t('title') }}</h2>
                            <p class="header-subtitle">{{ t('subtitle') }}</p>
                        </div>
                    </div>
                    <button
                        @click="isOpen = false"
                        class="close-button"
                        :aria-label="t('ariaCloseMenu')"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="panel-body">
                    <!-- Tamaño de Fuente -->
                    <div class="section">
                        <div class="section-header">
                            <label class="label">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                                {{ t('fontSize') }}
                            </label>
                            <span class="badge">{{ fontSize }}%</span>
                        </div>

                        <div class="font-controls">
                            <button
                                @click="decreaseFontSize"
                                :disabled="fontSize <= 80"
                                class="control-button"
                                :aria-label="t('decreaseFontSize')"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-sm">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </button>

                            <input
                                type="range"
                                v-model="fontSize"
                                min="80"
                                max="200"
                                step="10"
                                class="slider"
                            />

                            <button
                                @click="increaseFontSize"
                                :disabled="fontSize >= 200"
                                class="control-button"
                                :aria-label="t('increaseFontSize')"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-sm">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        </div>

                        <button @click="resetFontSize" class="reset-font-button">
                            {{ t('resetFontSize') }}
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Fuente para Dislexia -->
                    <div class="toggle-section">
                        <label class="label">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                            </svg>
                            {{ t('dyslexicFont') }}
                        </label>
                        <button
                            @click="isDyslexicFont = !isDyslexicFont"
                            :class="['toggle-button', { 'toggle-active': isDyslexicFont }]"
                            role="switch"
                            :aria-checked="isDyslexicFont"
                            :aria-label="t('ariaToggleDyslexic')"
                        >
                            <span :class="['toggle-circle', { 'toggle-circle-active': isDyslexicFont }]"></span>
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Alto Contraste -->
                    <div class="toggle-section">
                        <label class="label">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                            </svg>
                            {{ t('highContrast') }}
                        </label>
                        <button
                            @click="isHighContrast = !isHighContrast"
                            :class="['toggle-button', { 'toggle-active': isHighContrast }]"
                            role="switch"
                            :aria-checked="isHighContrast"
                            :aria-label="t('ariaToggleContrast')"
                        >
                            <span :class="['toggle-circle', { 'toggle-circle-active': isHighContrast }]"></span>
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Resaltar Enlaces -->
                    <div class="toggle-section">
                        <label class="label">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            {{ t('highlightLinks') }}
                        </label>
                        <button
                            @click="isHighlightLinks = !isHighlightLinks"
                            :class="['toggle-button', { 'toggle-active': isHighlightLinks }]"
                            role="switch"
                            :aria-checked="isHighlightLinks"
                            :aria-label="t('ariaToggleLinks')"
                        >
                            <span :class="['toggle-circle', { 'toggle-circle-active': isHighlightLinks }]"></span>
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Lector de Pantalla -->
                    <div class="section">
                        <label class="label">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                            {{ t('screenReader') }}
                        </label>
                        <button
                            @click="toggleReading"
                            :class="['action-button', { 'action-button-stop': isReading }]"
                        >
                            <svg v-if="isReading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                            {{ isReading ? t('stopReading') : t('readFullPage') }}
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Leer al Pasar el Mouse -->
                    <div class="toggle-with-description">
                        <div class="description-content">
                            <label class="label">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                                </svg>
                                {{ t('readOnHover') }}
                            </label>
                            <p class="description">{{ t('readOnHoverDesc') }}</p>
                        </div>
                        <button
                            @click="readOnHover = !readOnHover"
                            :class="['toggle-button', { 'toggle-active': readOnHover }]"
                            role="switch"
                            :aria-checked="readOnHover"
                            :aria-label="t('ariaToggleHover')"
                        >
                            <span :class="['toggle-circle', { 'toggle-circle-active': readOnHover }]"></span>
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Leer Texto Seleccionado -->
                    <div class="toggle-with-description">
                        <div class="description-content">
                            <label class="label">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                {{ t('readOnSelect') }}
                            </label>
                            <p class="description">{{ t('readOnSelectDesc') }}</p>
                        </div>
                        <button
                            @click="readOnSelect = !readOnSelect"
                            :class="['toggle-button', { 'toggle-active': readOnSelect }]"
                            role="switch"
                            :aria-checked="readOnSelect"
                            :aria-label="t('ariaToggleSelect')"
                        >
                            <span :class="['toggle-circle', { 'toggle-circle-active': readOnSelect }]"></span>
                        </button>
                    </div>

                    <div class="divider"></div>

                    <!-- Selector de Idioma -->
                    <div class="section">
                        <label class="label">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="label-icon">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                            </svg>
                            {{ t('language') }}
                        </label>
                        <div class="language-selector">
                            <button
                                v-for="lang in availableLocales"
                                :key="lang.code"
                                @click="setLocale(lang.code)"
                                :class="['language-button', { 'language-button-active': locale === lang.code }]"
                                :aria-label="`${t('language')}: ${lang.name}`"
                            >
                               
                                <span class="language-name">{{ lang.name }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <!-- Restablecer Todo -->
                    <button @click="resetAll" class="reset-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        {{ t('resetAll') }}
                    </button>

                    <!-- Información -->
                    <div class="info-box">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="info-icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <div>
                            <h4 class="info-title">{{ t('infoTitle') }}</h4>
                            <p class="info-text">{{ t('infoText') }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.accessibility-menu {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Botón flotante */
.accessibility-button {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    background-color: var(--accessibility-primary);
    color: white;
    border: none;
    border-radius: 50%;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;
}

.accessibility-button:hover {
    background-color: var(--accessibility-primary-hover);
    transform: scale(1.1);
}

.accessibility-button:focus {
    outline: none;
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accessibility-primary) 30%, transparent);
}

/* Overlay */
.overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
}

.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}

/* Panel */
.accessibility-panel {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    max-width: 24rem;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 50;
    overflow-y: auto;
}

.accessibility-panel.theme-auto {
    @media (prefers-color-scheme: dark) {
        background-color: #111827;
    }
}

.accessibility-panel.theme-dark {
    background-color: #111827;
}

.panel-enter-active,
.panel-leave-active {
    transition: transform 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
    transform: translateX(100%);
}

/* Header */
.panel-header {
    position: sticky;
    top: 0;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
}

.theme-auto .panel-header {
    @media (prefers-color-scheme: dark) {
        background-color: #111827;
        border-bottom-color: #1f2937;
    }
}

.theme-dark .panel-header {
    background-color: #111827;
    border-bottom-color: #1f2937;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.header-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--accessibility-primary);
}

.header-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
}

.theme-auto .header-title {
    @media (prefers-color-scheme: dark) {
        color: white;
    }
}

.theme-dark .header-title {
    color: white;
}

.header-subtitle {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
}

.theme-auto .header-subtitle {
    @media (prefers-color-scheme: dark) {
        color: #9ca3af;
    }
}

.theme-dark .header-subtitle {
    color: #9ca3af;
}

.close-button {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: none;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
}

.close-button:hover {
    background-color: #f3f4f6;
}

.theme-auto .close-button:hover {
    @media (prefers-color-scheme: dark) {
        background-color: #1f2937;
    }
}

.theme-dark .close-button:hover {
    background-color: #1f2937;
}

.close-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accessibility-primary);
}

.close-button .icon {
    color: #111827;
}

.theme-auto .close-button .icon {
    @media (prefers-color-scheme: dark) {
        color: white;
    }
}

.theme-dark .close-button .icon {
    color: white;
}

/* Body */
.panel-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.theme-auto .label {
    @media (prefers-color-scheme: dark) {
        color: #d1d5db;
    }
}

.theme-dark .label {
    color: #d1d5db;
}

.label-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    background-color: #dbeafe;
    color: #1e40af;
    border-radius: 0.25rem;
}

.theme-auto .badge {
    @media (prefers-color-scheme: dark) {
        background-color: #1e3a8a;
        color: #bfdbfe;
    }
}

.theme-dark .badge {
    background-color: #1e3a8a;
    color: #bfdbfe;
}

/* Font controls */
.font-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.control-button {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-button:hover:not(:disabled) {
    background-color: #f9fafb;
}

.theme-auto .control-button {
    @media (prefers-color-scheme: dark) {
        background-color: #111827;
        border-color: #4b5563;
        color: white;
    }
}

.theme-auto .control-button:hover:not(:disabled) {
    @media (prefers-color-scheme: dark) {
        background-color: #1f2937;
    }
}

.theme-dark .control-button {
    background-color: #111827;
    border-color: #4b5563;
    color: white;
}

.theme-dark .control-button:hover:not(:disabled) {
    background-color: #1f2937;
}

.control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.slider {
    flex: 1;
    height: 0.5rem;
    background-color: #e5e7eb;
    border-radius: 0.5rem;
    outline: none;
    cursor: pointer;
}

.slider::-webkit-slider-thumb {
    appearance: none;
    width: 1rem;
    height: 1rem;
    background-color: var(--accessibility-primary);
    border-radius: 50%;
    cursor: pointer;
}

.slider::-moz-range-thumb {
    width: 1rem;
    height: 1rem;
    background-color: var(--accessibility-primary);
    border-radius: 50%;
    border: none;
    cursor: pointer;
}

.theme-auto .slider {
    @media (prefers-color-scheme: dark) {
        background-color: #374151;
    }
}

.theme-dark .slider {
    background-color: #374151;
}

.reset-font-button {
    width: 100%;
    font-size: 0.75rem;
    color: #4b5563;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
    text-align: center;
}

.reset-font-button:hover {
    color: #111827;
}

.theme-auto .reset-font-button {
    @media (prefers-color-scheme: dark) {
        color: #9ca3af;
    }
}

.theme-auto .reset-font-button:hover {
    @media (prefers-color-scheme: dark) {
        color: white;
    }
}

.theme-dark .reset-font-button {
    color: #9ca3af;
}

.theme-dark .reset-font-button:hover {
    color: white;
}

/* Divider */
.divider {
    border-top: 1px solid #e5e7eb;
}

.theme-auto .divider {
    @media (prefers-color-scheme: dark) {
        border-top-color: #374151;
    }
}

.theme-dark .divider {
    border-top-color: #374151;
}

/* Toggle */
.toggle-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.toggle-button {
    position: relative;
    display: inline-flex;
    height: 1.5rem;
    width: 2.75rem;
    align-items: center;
    border-radius: 9999px;
    background-color: #e5e7eb;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    flex-shrink: 0;
}

.toggle-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accessibility-primary), 0 0 0 4px color-mix(in srgb, var(--accessibility-primary) 30%, transparent);
}

.toggle-button.toggle-active {
    background-color: var(--accessibility-primary);
}

.theme-auto .toggle-button {
    @media (prefers-color-scheme: dark) {
        background-color: #374151;
    }
}

.theme-dark .toggle-button {
    background-color: #374151;
}

.toggle-circle {
    display: inline-block;
    height: 1rem;
    width: 1rem;
    background-color: white;
    border-radius: 50%;
    transform: translateX(0.25rem);
    transition: transform 0.2s;
}

.toggle-circle.toggle-circle-active {
    transform: translateX(1.5rem);
}

/* Action button */
.action-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    color: white;
    background-color: var(--accessibility-primary);
    cursor: pointer;
    transition: background-color 0.2s;
}

.action-button:hover {
    background-color: var(--accessibility-primary-hover);
}

.action-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accessibility-primary), 0 0 0 4px color-mix(in srgb, var(--accessibility-primary) 30%, transparent);
}

.action-button.action-button-stop {
    background-color: #dc2626;
}

.action-button.action-button-stop:hover {
    background-color: #b91c1c;
}

/* Toggle with description */
.toggle-with-description {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
}

.description-content {
    flex: 1;
}

.description {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
}

.theme-auto .description {
    @media (prefers-color-scheme: dark) {
        color: #9ca3af;
    }
}

.theme-dark .description {
    color: #9ca3af;
}

/* Reset button */
.reset-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-weight: 500;
    color: #374151;
    background-color: #f3f4f6;
    cursor: pointer;
    transition: background-color 0.2s;
}

.reset-button:hover {
    background-color: #e5e7eb;
}

.theme-auto .reset-button {
    @media (prefers-color-scheme: dark) {
        color: #d1d5db;
        background-color: #1f2937;
        border-color: #4b5563;
    }
}

.theme-auto .reset-button:hover {
    @media (prefers-color-scheme: dark) {
        background-color: #374151;
    }
}

.theme-dark .reset-button {
    color: #d1d5db;
    background-color: #1f2937;
    border-color: #4b5563;
}

.theme-dark .reset-button:hover {
    background-color: #374151;
}

.reset-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accessibility-primary), 0 0 0 4px color-mix(in srgb, var(--accessibility-primary) 30%, transparent);
}

/* Info box */
.info-box {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
}

.theme-auto .info-box {
    @media (prefers-color-scheme: dark) {
        background-color: rgba(30, 58, 138, 0.2);
        border-color: #1e3a8a;
    }
}

.theme-dark .info-box {
    background-color: rgba(30, 58, 138, 0.2);
    border-color: #1e3a8a;
}

.info-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--accessibility-primary);
    flex-shrink: 0;
}

.theme-auto .info-icon {
    @media (prefers-color-scheme: dark) {
        color: color-mix(in srgb, var(--accessibility-primary) 80%, white);
    }
}

.theme-dark .info-icon {
    color: color-mix(in srgb, var(--accessibility-primary) 80%, white);
}

.info-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e3a8a;
    margin: 0;
}

.theme-auto .info-title {
    @media (prefers-color-scheme: dark) {
        color: #bfdbfe;
    }
}

.theme-dark .info-title {
    color: #bfdbfe;
}

.info-text {
    font-size: 0.75rem;
    color: #1e40af;
    margin: 0.25rem 0 0 0;
}

.theme-auto .info-text {
    @media (prefers-color-scheme: dark) {
        color: #93c5fd;
    }
}

.theme-dark .info-text {
    color: #93c5fd;
}

/* Icons */
.icon {
    width: 1.5rem;
    height: 1.5rem;
}

.icon-sm {
    width: 1rem;
    height: 1rem;
}

/* Language selector */
.language-selector {
    display: flex;
    gap: 0.5rem;
}

.language-button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    border: 2px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
}

.language-button:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

.theme-auto .language-button {
    @media (prefers-color-scheme: dark) {
        background-color: #111827;
        border-color: #4b5563;
    }
}

.theme-auto .language-button:hover {
    @media (prefers-color-scheme: dark) {
        background-color: #1f2937;
        border-color: #6b7280;
    }
}

.theme-dark .language-button {
    background-color: #111827;
    border-color: #4b5563;
}

.theme-dark .language-button:hover {
    background-color: #1f2937;
    border-color: #6b7280;
}

.language-button.language-button-active {
    border-color: var(--accessibility-primary);
    background-color: color-mix(in srgb, var(--accessibility-primary) 10%, white);
}

.theme-auto .language-button.language-button-active {
    @media (prefers-color-scheme: dark) {
        background-color: color-mix(in srgb, var(--accessibility-primary) 20%, #111827);
    }
}

.theme-dark .language-button.language-button-active {
    background-color: color-mix(in srgb, var(--accessibility-primary) 20%, #111827);
}

.language-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accessibility-primary), 0 0 0 4px color-mix(in srgb, var(--accessibility-primary) 30%, transparent);
}



.language-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
}

.theme-auto .language-name {
    @media (prefers-color-scheme: dark) {
        color: #d1d5db;
    }
}

.theme-dark .language-name {
    color: #d1d5db;
}

.language-button-active .language-name {
    color: var(--accessibility-primary);
    font-weight: 600;
}

.theme-auto .language-button-active .language-name {
    @media (prefers-color-scheme: dark) {
        color: color-mix(in srgb, var(--accessibility-primary) 80%, white);
    }
}

.theme-dark .language-button-active .language-name {
    color: color-mix(in srgb, var(--accessibility-primary) 80%, white);
}
</style>
