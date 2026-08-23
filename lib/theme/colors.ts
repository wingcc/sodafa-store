// lib/theme/colors.ts

export type ThemeColors = {
  darkGreen: string
  mediumGreen: string
  gold: string
  cream: string
  warmCream: string
  white: string
}

// Default brand colors — SSS Emerald Garden (chosen as dashboard default)
export const defaultColors: ThemeColors = {
  darkGreen: "#047857",
  mediumGreen: "#059669",
  gold: "#d97706",
  cream: "#fafaf7",
  warmCream: "#ecfdf5",
  white: "#ffffff",
}

// For backward compatibility and convenience
export const COLORS = defaultColors