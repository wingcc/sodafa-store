// lib/theme/ThemeProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeColors, defaultColors } from './colors'
import { applyTheme } from './cssVariables'

type ThemeMode = 'light' | 'dark'

type ThemeContextType = {
  // Brand colors
  colors: ThemeColors
  updateColors: (newColors: Partial<ThemeColors>) => void
  resetColors: () => void

  // Light / Dark mode
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const COLOR_STORAGE_KEY = 'app_brand_colors'
const THEME_STORAGE_KEY = 'app_theme_mode'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // --- 1. Brand Colors ---
  const getInitialColors = (): ThemeColors => {
    if (typeof window === 'undefined') return defaultColors
    try {
      const stored = localStorage.getItem(COLOR_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...defaultColors, ...parsed }
      }
    } catch (_) { /* ignore */ }
    return defaultColors
  }

  const [colors, setColors] = useState<ThemeColors>(getInitialColors)

  useEffect(() => {
    applyTheme(colors)
    if (typeof window !== 'undefined') {
      localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors))
    }
  }, [colors])

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors((prev) => ({ ...prev, ...newColors }))
  }

  const resetColors = () => {
    setColors(defaultColors)
    localStorage.removeItem(COLOR_STORAGE_KEY)
  }

  // --- 2. Light / Dark Mode ---
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light'
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === 'dark' || stored === 'light') return stored
    } catch (_) { /* ignore */ }
    // Check system preference as fallback
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode)
  }

  // --- Combine everything ---
  const value: ThemeContextType = {
    colors,
    updateColors,
    resetColors,
    theme,
    toggleTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}