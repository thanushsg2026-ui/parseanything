import React, { createContext, useContext, useEffect, useState } from 'react';
import { PresetThemeName, ThemeColors, ThemeMode } from '../types/document.js';

export interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  preset: PresetThemeName | 'custom';
  setPreset: (preset: PresetThemeName | 'custom') => void;
  colors: ThemeColors;
  updateCustomColor: (key: keyof ThemeColors, value: string) => void;
  resetTheme: () => void;
}

const THEME_PRESETS: Record<PresetThemeName, { light: ThemeColors; dark: ThemeColors }> = {
  indigo: {
    light: {
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      secondary: '#0ea5e9',
      accent: '#8b5cf6',
      background: '#f8fafc',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#e2e8f0',
      muted: '#64748b',
    },
    dark: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      secondary: '#38bdf8',
      accent: '#a78bfa',
      background: '#090d16',
      card: '#111827',
      foreground: '#f8fafc',
      border: '#1f293d',
      muted: '#94a3b8',
    },
  },
  blue: {
    light: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#0284c7',
      accent: '#3b82f6',
      background: '#f0f7ff',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#dbeafe',
      muted: '#64748b',
    },
    dark: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#38bdf8',
      accent: '#60a5fa',
      background: '#080e1a',
      card: '#0f172a',
      foreground: '#f8fafc',
      border: '#1e293b',
      muted: '#94a3b8',
    },
  },
  purple: {
    light: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: '#faf5ff',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#f3e8ff',
      muted: '#64748b',
    },
    dark: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      secondary: '#c084fc',
      accent: '#d8b4fe',
      background: '#0e0a1a',
      card: '#18112e',
      foreground: '#f8fafc',
      border: '#2a1e4d',
      muted: '#94a3b8',
    },
  },
  emerald: {
    light: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#10b981',
      accent: '#14b8a6',
      background: '#f0fdf4',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#dcfce7',
      muted: '#64748b',
    },
    dark: {
      primary: '#10b981',
      primaryHover: '#059669',
      secondary: '#34d399',
      accent: '#2dd4bf',
      background: '#06130e',
      card: '#0b1f17',
      foreground: '#f8fafc',
      border: '#143628',
      muted: '#94a3b8',
    },
  },
  cyan: {
    light: {
      primary: '#0891b2',
      primaryHover: '#0e7490',
      secondary: '#06b6d4',
      accent: '#0284c7',
      background: '#ecfeff',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#cffafe',
      muted: '#64748b',
    },
    dark: {
      primary: '#06b6d4',
      primaryHover: '#0891b2',
      secondary: '#22d3ee',
      accent: '#38bdf8',
      background: '#041317',
      card: '#082129',
      foreground: '#f8fafc',
      border: '#103744',
      muted: '#94a3b8',
    },
  },
  rose: {
    light: {
      primary: '#e11d48',
      primaryHover: '#be123c',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#fff1f2',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#ffe4e6',
      muted: '#64748b',
    },
    dark: {
      primary: '#f43f5e',
      primaryHover: '#e11d48',
      secondary: '#fb7185',
      accent: '#fda4af',
      background: '#16080b',
      card: '#240d12',
      foreground: '#f8fafc',
      border: '#3b171f',
      muted: '#94a3b8',
    },
  },
  amber: {
    light: {
      primary: '#d97706',
      primaryHover: '#b45309',
      secondary: '#f59e0b',
      accent: '#b45309',
      background: '#fffbeb',
      card: '#ffffff',
      foreground: '#0f172a',
      border: '#fef3c7',
      muted: '#64748b',
    },
    dark: {
      primary: '#f59e0b',
      primaryHover: '#d97706',
      secondary: '#fbbf24',
      accent: '#fde68a',
      background: '#140e04',
      card: '#221808',
      foreground: '#f8fafc',
      border: '#39280d',
      muted: '#94a3b8',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pa_theme_mode') as ThemeMode) || 'dark';
  });

  const [preset, setPresetState] = useState<PresetThemeName | 'custom'>(() => {
    return (localStorage.getItem('pa_theme_preset') as PresetThemeName | 'custom') || 'indigo';
  });

  const [customColors, setCustomColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('pa_custom_colors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return THEME_PRESETS.indigo.dark;
  });

  // Effective colors based on mode and preset
  const isDarkMode =
    mode === 'dark' ||
    (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const activeColors: ThemeColors =
    preset === 'custom'
      ? customColors
      : isDarkMode
      ? THEME_PRESETS[preset].dark
      : THEME_PRESETS[preset].light;

  useEffect(() => {
    localStorage.setItem('pa_theme_mode', mode);
    localStorage.setItem('pa_theme_preset', preset);
  }, [mode, preset]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS variables
    root.style.setProperty('--primary', activeColors.primary);
    root.style.setProperty('--primary-hover', activeColors.primaryHover || activeColors.primary);
    root.style.setProperty('--secondary', activeColors.secondary);
    root.style.setProperty('--accent', activeColors.accent);
    root.style.setProperty('--background', activeColors.background);
    root.style.setProperty('--card', activeColors.card);
    root.style.setProperty('--foreground', activeColors.foreground);
    root.style.setProperty('--border', activeColors.border);
    root.style.setProperty('--muted', activeColors.muted);
  }, [isDarkMode, activeColors]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setPreset = (newPreset: PresetThemeName | 'custom') => {
    setPresetState(newPreset);
  };

  const updateCustomColor = (key: keyof ThemeColors, value: string) => {
    const updated = { ...activeColors, [key]: value };
    setCustomColors(updated);
    setPresetState('custom');
    localStorage.setItem('pa_custom_colors', JSON.stringify(updated));
  };

  const resetTheme = () => {
    setPresetState('indigo');
    setModeState('dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        preset,
        setPreset,
        colors: activeColors,
        updateCustomColor,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { THEME_PRESETS };
