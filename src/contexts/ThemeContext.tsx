/**
 * @file contexts/ThemeContext.tsx
 * @description Contexto de tema para alternância claro/escuro e personalização de cores.
 * Gerencia e persiste a preferência visual do usuário.
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/** Tipos de tema disponíveis */
export type ThemeType = 'light' | 'dark';

/** Paleta de cores de destaque disponíveis */
export type AccentColor = 'indigo' | 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red';

/** Cores de destaque predefinidas */
export const ACCENT_COLORS: Record<AccentColor, { primary: string; primaryHover: string; secondary: string }> = {
  indigo: { primary: '#6366f1', primaryHover: '#4f46e5', secondary: '#8b5cf6' },
  purple: { primary: '#a855f7', primaryHover: '#9333ea', secondary: '#c084fc' },
  blue: { primary: '#3b82f6', primaryHover: '#2563eb', secondary: '#60a5fa' },
  green: { primary: '#10b981', primaryHover: '#059669', secondary: '#34d399' },
  orange: { primary: '#f97316', primaryHover: '#ea580c', secondary: '#fb923c' },
  pink: { primary: '#ec4899', primaryHover: '#db2777', secondary: '#f472b6' },
  red: { primary: '#ef4444', primaryHover: '#dc2626', secondary: '#f87171' },
};

/** Interface que define as cores do tema */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  border: string;
  shadow: string;
  overlay: string;
  inputBackground: string;
  placeholder: string;
}

/** Interface do tema completo */
export interface Theme {
  type: ThemeType;
  colors: ThemeColors;
  borderRadius: string;
  shadows: { sm: string; md: string; lg: string };
};

/**
 * Cria tema com cor de destaque personalizada
 * @param base - Cores base do tema (light ou dark)
 * @param accent - Cor de destaque selecionada
 * @returns Theme com cores atualizadas
 */
function createTheme(base: 'light' | 'dark', accent: AccentColor): Theme {
  const accentColors = ACCENT_COLORS[accent];
  const isLight = base === 'light';

  return {
    type: base,
    colors: {
      background: isLight ? '#f5f5f5' : '#0f0f23',
      surface: isLight ? '#ffffff' : '#1a1a2e',
      surfaceHover: isLight ? '#f0f0f0' : '#252542',
      text: isLight ? '#1a1a2e' : '#f1f1f1',
      textSecondary: isLight ? '#6b7280' : '#9ca3af',
      primary: accentColors.primary,
      primaryHover: accentColors.primaryHover,
      secondary: accentColors.secondary,
      success: isLight ? '#10b981' : '#34d399',
      error: isLight ? '#ef4444' : '#f87171',
      warning: isLight ? '#f59e0b' : '#fbbf24',
      info: isLight ? '#3b82f6' : '#60a5fa',
      border: isLight ? '#e5e7eb' : '#374151',
      shadow: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
      overlay: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)',
      inputBackground: isLight ? '#ffffff' : '#252542',
      placeholder: isLight ? '#9ca3af' : '#6b7280',
    },
    borderRadius: '8px',
    shadows: {
      sm: isLight ? '0 1px 2px 0 rgba(0,0,0,0.05)' : '0 1px 2px 0 rgba(0,0,0,0.2)',
      md: isLight ? '0 4px 6px -1px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.3)',
      lg: isLight ? '0 10px 15px -3px rgba(0,0,0,0.1)' : '0 10px 15px -3px rgba(0,0,0,0.4)',
    },
  };
}

/** Interface do contexto de tema */
interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  accentColor: AccentColor;
  toggleTheme: () => void;
  setTheme: (type: ThemeType) => void;
  setAccentColor: (color: AccentColor) => void;
}

/** Contexto de tema */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider de tema
 * Aplica variáveis CSS no elemento raiz para estilização global
 * @param {object} props - Props do provider
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [storedTheme, setStoredTheme] = useLocalStorage<ThemeType>('financas_theme', 'light');
  const [storedAccent, setStoredAccent] = useLocalStorage<AccentColor>('financas_accent', 'indigo');
  const [themeType, setThemeType] = useState<ThemeType>(storedTheme);
  const [accentColor, setAccentColorState] = useState<AccentColor>(storedAccent);
  const theme = createTheme(themeType, accentColor);

  /** Alterna entre tema claro e escuro */
  const toggleTheme = useCallback(() => {
    setThemeType((prev) => {
      const newType = prev === 'light' ? 'dark' : 'light';
      setStoredTheme(newType);
      return newType;
    });
  }, [setStoredTheme]);

  /** Define um tema específico */
  const setTheme = useCallback(
    (type: ThemeType) => {
      setThemeType(type);
      setStoredTheme(type);
    },
    [setStoredTheme]
  );

  /** Define a cor de destaque */
  const setAccentColor = useCallback(
    (color: AccentColor) => {
      setAccentColorState(color);
      setStoredAccent(color);
    },
    [setStoredAccent]
  );

  // Aplica cores como variáveis CSS no :root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    root.style.setProperty('--border-radius', theme.borderRadius);
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);
    document.body.setAttribute('data-theme', themeType);
  }, [theme, themeType]);

  return (
    <ThemeContext.Provider value={{ theme, themeType, accentColor, toggleTheme, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acessar contexto de tema
 * @returns {ThemeContextType} Valores e funções do tema
 * @throws {Error} Se usado fora do ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export default ThemeContext;
