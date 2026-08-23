// lib/theme/cssVariables.ts
import { ThemeColors } from './colors'
import type { DashboardPalette } from './palettes'

// Map our color names to CSS custom property names
export const colorToCssVar = (colorName: keyof ThemeColors): string => {
  return `--color-${colorName}`
}

export const applyTheme = (colors: ThemeColors): void => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Convert hex to RGB for use with rgba()
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return '0,0,0'
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }

  Object.entries(colors).forEach(([key, value]) => {
    const varName = colorToCssVar(key as keyof ThemeColors)
    root.style.setProperty(varName, value)

    // Also set an RGB version for transparency effects (e.g., rgba(var(--color-gold-rgb), 0.5))
    const rgbVarName = varName + '-rgb'
    root.style.setProperty(rgbVarName, hexToRgb(value))
  })
}

export const applyDashboardPalettes = (light: DashboardPalette, dark: DashboardPalette): void => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // Light dashboard tokens
  root.style.setProperty('--dashboard-bg-light', light.light.bg)
  root.style.setProperty('--dashboard-card-light', light.light.card)
  root.style.setProperty('--dashboard-card-border-light', light.light.cardBorder)
  root.style.setProperty('--dashboard-input-bg-light', light.light.inputBg)
  root.style.setProperty('--dashboard-input-border-light', light.light.inputBorder)
  // Dark dashboard tokens
  root.style.setProperty('--dashboard-bg-dark', dark.dark.bg)
  root.style.setProperty('--dashboard-card-dark', dark.dark.card)
  root.style.setProperty('--dashboard-card-border-dark', dark.dark.cardBorder)
  root.style.setProperty('--dashboard-input-bg-dark', dark.dark.inputBg)
  root.style.setProperty('--dashboard-input-border-dark', dark.dark.inputBorder)
  // Accent colors for active states, buttons, highlights
  root.style.setProperty('--color-accent-light', light.accent)
  root.style.setProperty('--color-accent-dark', dark.accent)
}