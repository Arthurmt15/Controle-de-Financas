/**
 * @file contexts/ThemeContext.tsx
 * @description Contexto de tema para alternância claro/escuro.
 * Gerencia e persiste a preferência visual do usuário.
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/** Tipos de tema disponíveis */
export type ThemeType = 'light' | 'dark';

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
}

/** Tema claro - cores suaves e leves */
const lightTheme: Theme = {
  type: 'light',
  colors: {
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceHover: '#f0f0f0',
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    secondary: '#8b5cf6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    inputBackground: '#ffffff',
    placeholder: '#9ca3af',
  },
  borderRadius: '8px',
  shadows: { sm: '0 1px 2px 0 rgba(0,0,0,0.05)', md: '0 4px 6px -1px rgba(0,0,0,0.1)', lg: '0 10px 15px -3px rgba(0,0,0,0.1)' },
};

/** Tema escuro - cores escuras e confortáveis */
const darkTheme: Theme = {
  type: 'dark',
  colors: {
    background: '#0f0f23',
    surface: '#1a1a2e',
    surfaceHover: '#252542',
    text: '#f1f1f1',
    textSecondary: '#9ca3af',
    primary: '#818cf8',
    primaryHover: '#6366f1',
    secondary: '#a78bfa',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    inputBackground: '#252542',
    placeholder: '#6b7280',
  },
  borderRadius: '8px',
  shadows: { sm: '0 1px 2px 0 rgba(0,0,0,0.2)', md: '0 4px 6px -1px rgba(0,0,0,0.3)', lg: '0 10px 15px -3px rgba(0,0,0,0.4)' },
};

/** Interface do contexto de tema */
interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
  setTheme: (type: ThemeType) => void;
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
  const [themeType, setThemeType] = useState<ThemeType>(storedTheme);
  const theme = themeType === 'dark' ? darkTheme : lightTheme;

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
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme, setTheme }}>
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
