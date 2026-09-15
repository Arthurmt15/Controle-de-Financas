/**
 * @file pages/Login/index.tsx
 * @description Página de autenticação unificada.
 * Suporta Google Identity Services (local) e Supabase Auth (produção).
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { isSupabase } from '../../services/data';
import Icon from '../../components/common/Icon';
import { HeroVisual } from './components/HeroVisual';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const LoginPage: React.FC = () => {
  const { isAuthenticated, error, clearError, loginWithGoogle } = useAuth();
  const { themeType, toggleTheme, theme } = useTheme();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSupabase) return;

    const loadGoogleScript = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleSignIn();
      document.body.appendChild(script);
    };

    loadGoogleScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services não disponível');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    });

    if (googleButtonRef.current) {
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: themeType === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }
  };

  const handleGoogleCallback = (response: { credential: string }) => {
    loginWithGoogle(response);
  };

  const getThemeClasses = () => {
    const isDark = themeType === 'dark';
    return {
      container: isDark
        ? 'min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0f1e]'
        : 'min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f5f5f5]',
      hero: isDark
        ? 'hidden lg:flex items-center p-20 bg-gradient-to-br from-[#0a0f1e] to-[#0d1328]'
        : 'hidden lg:flex items-center p-20 bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]',
      logo: isDark
        ? 'w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-[0_0_35px_rgba(99,102,241,0.35)]'
        : 'w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-[0_0_35px_rgba(99,102,241,0.2)]',
      heroTitle: isDark
        ? 'text-white text-5xl lg:text-6xl font-bold leading-tight tracking-tight'
        : 'text-gray-900 text-5xl lg:text-6xl font-bold leading-tight tracking-tight',
      gradientText: 'bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] bg-clip-text text-transparent',
      heroDesc: 'text-gray-400 text-lg leading-relaxed mt-6 mb-10',
      featureTitle: isDark ? 'text-white text-sm font-semibold' : 'text-gray-900 text-sm font-semibold',
      featureDesc: 'text-gray-400 text-xs',
      loginSection: 'flex items-center justify-center p-8 lg:p-16 relative overflow-hidden',
      loginCard: isDark
        ? 'w-full max-w-[480px] p-8 lg:p-10 bg-[rgba(17,26,51,0.92)] backdrop-blur-xl border border-white/[0.08] rounded-[28px] shadow-[0_20px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] relative'
        : 'w-full max-w-[480px] p-8 lg:p-10 bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-[28px] shadow-[0_20px_80px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] relative',
      title: isDark ? 'text-white text-3xl font-bold' : 'text-gray-900 text-3xl font-bold',
      subtitle: 'text-gray-400 text-base',
      registerText: 'text-gray-500 text-xs',
      registerLink: 'text-[#6366f1] text-xs hover:text-[#4f46e5] dark:hover:text-white font-medium transition-colors',
      themeButton: `absolute top-4 right-4 w-10 h-10 rounded-full border bg-card flex items-center justify-center cursor-pointer hover:scale-110 shadow-lg hover:border-primary/30 transition-all`,
      googleButton: isDark
        ? 'w-full py-3 px-6 flex items-center justify-center gap-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none text-base'
        : 'w-full py-3 px-6 flex items-center justify-center gap-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-300 text-base',
    };
  };

  const classes = getThemeClasses();

  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className={classes.container}>
      <section className={`${classes.hero} relative overflow-hidden`}>
        <div className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full blur-[90px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full blur-[80px] opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: themeType === 'dark' ? 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)' : 'linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <HeroVisual classes={classes} />
      </section>

      <section className={classes.loginSection}>
        <div className={classes.loginCard} style={{ position: 'relative' }}>
          <button className={classes.themeButton} onClick={toggleTheme} aria-label="Alternar tema">
            {themeType === 'light' ? (
              <Icon color={theme.colors.primary}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </Icon>
            ) : (
              <Icon color={theme.colors.primary}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </Icon>
            )}
          </button>

          <div className="text-center mb-9">
            <h2 className={classes.title}>Bem-vindo de volta!</h2>
            <p className={classes.subtitle}>Entre para acessar sua conta</p>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 mb-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm text-center" role="alert">
              <span></span>
              <span>{error}</span>
              <button onClick={clearError} className="ml-1 text-red-500 text-lg leading-none" aria-label="Fechar erro">×</button>
            </div>
          )}

          {isSupabase ? (
            <button onClick={() => loginWithGoogle()} className={classes.googleButton}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>
          ) : (
            <div ref={googleButtonRef} className="w-full flex justify-center" />
          )}

          <div className="flex justify-center items-center gap-2 mt-7">
            <span className={classes.registerText}>Ainda não tem uma conta?</span>
            <button type="button" className={classes.registerLink}>Criar conta</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
