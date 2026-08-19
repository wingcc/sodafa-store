// lib/theme/colors.ts

export type ThemeColors = {
  darkGreen: string
  mediumGreen: string
  gold: string
  cream: string
  warmCream: string
  white: string
}

// Default brand colors
export const defaultColors: ThemeColors = {
  darkGreen: "#0a2c23",
  mediumGreen: "#0f3d31",
  gold: "#cda552",
  cream: "#f7f3ec",
  warmCream: "#ece3d4",
  white: "#ffffff",
}

// For backward compatibility and convenience
export const COLORS = defaultColors