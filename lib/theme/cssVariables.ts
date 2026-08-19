// lib/theme/cssVariables.ts
import { ThemeColors } from './colors'

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