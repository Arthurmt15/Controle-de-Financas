/**
 * @file pages/Login/index.tsx
 * @description Página de autenticação com Google OAuth.
 * Utiliza Google Identity Services para login seguro e fácil.
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as C from './styles';

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
  const { isAuthenticated, error, clearError } = useAuth();
  const { themeType, toggleTheme } = useTheme();
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
    const { loginWithGoogle } = useAuth();
    loginWithGoogle(response);
  };

  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  return (
    <C.Container>
      <C.Card>
        {/* Toggle tema */}
        <C.ThemeButton onClick={toggleTheme} aria-label="Alternar tema">
          {themeType === 'light' ? '🌙' : '☀️'}
        </C.ThemeButton>

        {/* Logo */}
        <C.Logo>
          <C.LogoIcon>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.93-3.12 3.19z" />
            </svg>
          </C.LogoIcon>
          <C.LogoText>Finanças</C.LogoText>
        </C.Logo>

        <C.Title>Bem-vindo de volta!</C.Title>
        <C.Subtitle>Gerencie suas finanças de forma inteligente</C.Subtitle>

        {/* Mensagem de erro */}
        {error && (
          <C.ErrorMessage role="alert">
            <C.ErrorIcon>⚠️</C.ErrorIcon>
            <span>{error}</span>
            <C.ErrorClose onClick={clearError} aria-label="Fechar erro">
              ×
            </C.ErrorClose>
          </C.ErrorMessage>
        )}

        {/* Botão do Google */}
        <C.GoogleSection>
          <C.GoogleButtonContainer ref={googleButtonRef} />

          {/* Fallback caso o Google não carregue */}
          <C.FallbackText>
            Clique no botão acima para entrar com sua conta Google
          </C.FallbackText>
        </C.GoogleSection>

        {/* Informações de segurança */}
        <C.SecurityInfo>
          <C.SecurityIcon>🔒</C.SecurityIcon>
          <C.SecurityText>
            Seus dados estão seguros. Utilizamos autenticação OAuth do Google
            para garantir a segurança da sua conta.
          </C.SecurityText>
        </C.SecurityInfo>

        {/* Funcionalidades */}
        <C.Features>
          <C.FeatureItem>
            <C.FeatureIcon>📊</C.FeatureIcon>
            <span>Dashboards detalhados</span>
          </C.FeatureItem>
          <C.FeatureItem>
            <C.FeatureIcon>💳</C.FeatureIcon>
            <span>Controle de gastos</span>
          </C.FeatureItem>
          <C.FeatureItem>
            <C.FeatureIcon>📈</C.FeatureIcon>
            <span>Relatórios inteligentes</span>
          </C.FeatureItem>
        </C.Features>
      </C.Card>
    </C.Container>
  );
};

export default LoginPage;
