/**
 * @file pages/Login/index.tsx
 * @description Página de autenticação com Google OAuth.
 * Utiliza Google Identity Services para login seguro e fácil.
 * Layout split com hero à esquerda e formulário à direita.
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../components/common/Icon';

/**
 * ID do cliente Google (substitua pelo seu)
 * Para obter: https://console.cloud.google.com/apis/credentials
 */
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

/**
 * Página de Login
 * @returns {JSX.Element} Página renderizada
 *
 * @example
 * <LoginPage />
 */
const LoginPage: React.FC = () => {
  const { isAuthenticated, error, clearError, loginWithGoogle } = useAuth();
  const { themeType, toggleTheme, theme } = useTheme();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  /**
   * Inicializa o Google Identity Services
   */
  useEffect(() => {
    // Verifica se o script do Google já foi carregado
    const loadGoogleScript = () => {
      // Se já existe, não adiciona novamente
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

  /**
   * Inicializa o Google Sign-In
   */
  const initializeGoogleSignIn = () => {
    if (!window.google?.accounts?.id) {
      console.warn('Google Identity Services não disponível');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    });

    // Renderiza o botão do Google
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

  /**
   * Callback do Google Sign-In
   * @param {object} response - Resposta do Google com credential
   */
  const handleGoogleCallback = (response: { credential: string }) => {
    loginWithGoogle(response);
  };

  /**
   * Retorna as classes CSS baseadas no tema atual
   */
  const getThemeClasses = () => {
    const isDark = themeType === 'dark';
    return {
      container: isDark
        ? 'min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0f0f23]'
        : 'min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f5f5f5]',
      hero: isDark
        ? 'hidden lg:flex items-center p-20 bg-gradient-to-br from-[#0f0f23] to-[#080b16]'
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
      loginSection: 'flex items-center justify-center p-12 lg:p-16',
      loginCard: isDark
        ? 'w-full max-w-lg p-10 lg:p-12 bg-gradient-to-br from-[rgba(16,21,34,0.96)] to-[rgba(8,12,21,0.98)] border border-gray-700 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]'
        : 'w-full max-w-lg p-10 lg:p-12 bg-gradient-to-br from-[rgba(255,255,255,0.96)] to-[rgba(255,255,255,0.98)] border border-gray-200 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.1)]',
      title: isDark ? 'text-white text-3xl font-bold' : 'text-gray-900 text-3xl font-bold',
      subtitle: 'text-gray-400 text-base',
      registerText: 'text-gray-500 text-xs',
      registerLink: 'text-[#6366f1] text-xs hover:text-white',
      themeButton: `absolute top-4 right-4 w-10 h-10 rounded-full border-none bg-white flex items-center justify-center cursor-pointer hover:scale-110 shadow-lg`,
    };
  };

  const classes = getThemeClasses();

  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className={classes.container}>
      {/* Hero Section */}
      <section className={classes.hero}>
        <div className="w-full max-w-xl">
          <div className={classes.logo}>
            <span className="text-4xl font-bold text-white">$</span>
          </div>

          <h1 className={classes.heroTitle}>
            Controle suas<br />
            finanças com<br />
            <span className={classes.gradientText}>inteligência</span>
          </h1>

          <p className={classes.heroDesc}>
            Dashboards completos, controle de gastos
            e relatórios que ajudam você a tomar
            melhores decisões.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl text-xl text-[#a855f7] bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.25)]">
                ▮▮▮
              </div>
              <div>
                <h3 className={classes.featureTitle}>Dashboards detalhados</h3>
                <p className={classes.featureDesc}>Visualize seus dados de forma clara</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl text-xl text-[#3b82f6] bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.25)]">
                ▤
              </div>
              <div>
                <h3 className={classes.featureTitle}>Controle de gastos</h3>
                <p className={classes.featureDesc}>Acompanhe e categorize despesas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl text-xl text-[#00d9b5] bg-[rgba(0,217,181,0.08)] border border-[rgba(0,217,181,0.25)]">
                ↗
              </div>
              <div>
                <h3 className={classes.featureTitle}>Relatórios inteligentes</h3>
                <p className={classes.featureDesc}>Insights para melhores decisões</p>
              </div>
            </div>
          </div>

          <div className="relative h-44 mt-12 overflow-hidden">
            <div className="absolute bottom-0 left-5 flex items-end gap-3 h-full">
              {[30, 55, 80, 65, 100, 130, 160].map((height, i) => (
                <div
                  key={i}
                  className="w-7 rounded-t bg-gradient-to-t from-[rgba(99,102,241,0.15)] to-[rgba(99,102,241,0.45)]"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
              <path
                d="M0 150 C40 140 60 120 100 130 C140 140 145 90 180 95 C220 100 225 145 260 120 C300 90 310 100 335 50 C350 25 375 20 400 5"
                fill="none"
                stroke="#00d9b5"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(0,217,181,0.4)]"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Login Section */}
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
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={clearError} className="ml-1 text-red-500 text-lg leading-none" aria-label="Fechar erro">×</button>
            </div>
          )}

          <div ref={googleButtonRef} className="w-full flex justify-center" />

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
