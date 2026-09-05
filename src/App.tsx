/**
 * @file App.tsx
 * @description Componente raiz da aplicação com rotas lazy-loaded.
 * Implementa code splitting para melhor performance.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import Header from './components/layout/Header';
import SkipLink from './components/common/SkipLink';
import GlobalStyle from './Styles/global';

// Lazy loading das páginas (code splitting)
const LoginPage = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const TransactionsPage = lazy(() => import('./pages/Transactions'));
const ReportsPage = lazy(() => import('./pages/Reports'));
const SettingsPage = lazy(() => import('./pages/Settings'));

/**
 * Componente de carregamento exibido durante lazy load
 */
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#6b7280',
    }}
  >
    <span>Carregando...</span>
  </div>
);

/**
 * Rotas protegidas (requer autenticação)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Layout principal com Header
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <SkipLink />
    <Header />
    <main id="main-content" tabIndex={-1} style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {children}
    </main>
  </>
);

/**
 * Rotas autenticadas
 */
const AuthenticatedRoutes: React.FC = () => (
  <TransactionsProvider>
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  </TransactionsProvider>
);

/**
 * Rotas públicas
 */
const PublicRoutes: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
);

/**
 * Gerenciador de rotas baseado em autenticação
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedRoutes /> : <PublicRoutes />;
};

/**
 * Wrapper que conecta o ThemeContext ao ThemeProvider do styled-components
 */
const StyledThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};

/**
 * Componente raiz da aplicação
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <StyledThemeWrapper>
          <AuthProvider>
            <AppRoutes />
            <GlobalStyle />
          </AuthProvider>
        </StyledThemeWrapper>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
