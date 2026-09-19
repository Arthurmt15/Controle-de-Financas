/**
 * @file contexts/ThemeContext.tsx
 * @description Sistema de tema premium — paleta fintech redesenhada para dark mode impecável.
 * Light: slate limpo com contraste AA. Dark: navy profundo com hierarquia de superfícies e bordas visíveis.
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/** Tipos de tema disponíveis */
export type ThemeType = 'light' | 'dark';

/** Paleta de cores de destaque disponíveis */
export type AccentColor = 'indigo' | 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red';

/** Cores de destaque predefinidas */
export const ACCENT_COLORS: Record<
  AccentColor,
  { primary: string; primaryHover: string; secondary: string }
> = {
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
}

/**
 * Cria tema com cor de destaque personalizada
 * Paleta dark redesenhada: camadas distintas (bg < surface < hover), borda visível mas sutil,
 * texto com contraste WCAG AA, sombras profundas com tint indigo para elegância fintech.
 */
function createTheme(base: 'light' | 'dark', accent: AccentColor): Theme {
  const accentColors = ACCENT_COLORS[accent];
  const isLight = base === 'light';
  if (isLight) {
    return {
      type: base,
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        surfaceHover: '#f1f5f9',
        text: '#0f172a',
        textSecondary: '#64748b',
        primary: accentColors.primary,
        primaryHover: accentColors.primaryHover,
        secondary: accentColors.secondary,
        success: '#059669',
        error: '#dc2626',
        warning: '#d97706',
        info: '#2563eb',
        border: '#e2e8f0',
        shadow: 'rgba(15,23,42,0.06)',
        overlay: 'rgba(15,23,42,0.45)',
        inputBackground: '#ffffff',
        placeholder: '#94a3b8',
      },
      borderRadius: '16px',
      shadows: {
        sm: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)',
        md: '0 4px 16px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.07)',
        lg: '0 12px 40px rgba(15,23,42,0.08)',
      },
    };
  }
  // ---- DARK: premium navy, não preto chapado ----
  return {
    type: base,
    colors: {
      background: '#0a0f1e',
      surface: '#111a33',
      surfaceHover: '#1a2442',
      text: '#eef2ff',
      textSecondary: '#8b9bb5',
      primary: accentColors.primary,
      primaryHover: accentColors.primaryHover,
      secondary: accentColors.secondary,
      success: '#10b981',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
      // borda visível: garante separação de cards em navy profundo
      border: 'rgba(148,163,184,0.12)',
      shadow: 'rgba(0,0,0,0.55)',
      overlay: 'rgba(2,6,23,0.72)',
      inputBackground: '#0f1a33',
      placeholder: '#5b6b8a',
    },
    borderRadius: '16px',
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.35)',
      md: '0 8px 24px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
      lg: '0 16px 48px rgba(0,0,0,0.55)',
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
 * - Sincroniza classe .dark no <html> para Tailwind
 * - Aplica variáveis CSS para styled-components
 * - Define color-scheme e meta theme-color
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [storedTheme, setStoredTheme] = useLocalStorage<ThemeType>('financas_theme', 'light');
  const [storedAccent, setStoredAccent] = useLocalStorage<AccentColor>('financas_accent', 'indigo');
  const [themeType, setThemeType] = useState<ThemeType>(() => {
    // Hidratação: respeita preferência do sistema se nada salvo
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('financas_theme');
      if (saved) {
        try {
          return JSON.parse(saved) as ThemeType;
        } catch {
          /* fallback */
        }
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return storedTheme;
  });
  const [accentColor, setAccentColorState] = useState<AccentColor>(storedAccent);
  const theme = createTheme(themeType, accentColor);

  const toggleTheme = useCallback(() => {
    setThemeType((prev) => {
      const newType = prev === 'light' ? 'dark' : 'light';
      setStoredTheme(newType);
      return newType;
    });
  }, [setStoredTheme]);

  const setTheme = useCallback(
    (type: ThemeType) => {
      setThemeType(type);
      setStoredTheme(type);
    },
    [setStoredTheme]
  );

  const setAccentColor = useCallback(
    (color: AccentColor) => {
      setAccentColorState(color);
      setStoredAccent(color);
    },
    [setStoredAccent]
  );

  // Aplica tema no DOM: classe .dark, color-scheme, CSS vars, meta theme-color
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Tailwind: classe .dark no <html>
    root.classList.toggle('dark', themeType === 'dark');
    // Suporte nativo do browser (scrollbar, inputs, etc)
    root.style.colorScheme = themeType;
    body.setAttribute('data-theme', themeType);

    // Variáveis para styled-components
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    root.style.setProperty('--border-radius', theme.borderRadius);
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);

    // Atualiza <meta name="theme-color"> para mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeType === 'dark' ? '#0a0f1e' : '#6366f1');

    // Evita flash: remove classe de bloqueio de transição após primeira aplicação
    if (root.classList.contains('theme-loading')) {
      requestAnimationFrame(() => root.classList.remove('theme-loading'));
    }
  }, [theme, themeType]);

  return (
    <ThemeContext.Provider
      value={{ theme, themeType, accentColor, toggleTheme, setTheme, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

export default ThemeContext;
