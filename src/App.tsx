/**
 * @file App.tsx
 * @description Componente raiz da aplicação com rotas lazy-loaded.
 * Implementa code splitting para melhor performance.
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { InstallmentsProvider } from './contexts/InstallmentsContext';
import { DebtsProvider } from './contexts/DebtsContext';
import { FutureExpensesProvider } from './contexts/FutureExpensesContext';
import { EmergencyReserveProvider } from './contexts/EmergencyReserveContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import styled from 'styled-components';
import Header from './components/layout/Header';
import SkipLink from './components/common/SkipLink';
import FloatingChat from './components/features/FloatingChat';
import ErrorBoundary from './components/common/ErrorBoundary';
import GlobalStyle from './Styles/global';
import { lazyWithRetry, clearChunkReloadFlag } from './utils/lazyWithRetry';

const Main = styled.main`
  padding: 24px;
  padding-top: 72px;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
  min-height: calc(100vh - 72px);

  @media (max-width: 640px) {
    padding: 16px;
    padding-top: 64px;
  }
`;

// Lazy loading das páginas (code splitting) com retry anti-ChunkLoadError pós-deploy
const LoginPage = lazyWithRetry(() => import('./pages/Login'));
const DashboardPage = lazyWithRetry(() => import('./pages/Dashboard'));
const TransactionsPage = lazyWithRetry(() => import('./pages/Transactions'));
const AnalysisPage = lazyWithRetry(() => import('./pages/Analysis'));
const SettingsPage = lazyWithRetry(() => import('./pages/Settings'));
const InstallmentsPage = lazyWithRetry(() => import('./pages/Installments'));
const DebtsPage = lazyWithRetry(() => import('./pages/Debts'));
const EmergencyReservePage = lazyWithRetry(() => import('./pages/EmergencyReserve'));
const FutureExpensesPage = lazyWithRetry(() => import('./pages/FutureExpenses'));

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
    <Main id="main-content" tabIndex={-1}>
      {children}
    </Main>
    <FloatingChat />
  </>
);

/**
 * Rotas autenticadas
 */
const AuthenticatedRoutes: React.FC = () => (
  <ErrorBoundary>
    <TransactionsProvider>
      <InstallmentsProvider>
        <DebtsProvider>
          <EmergencyReserveProvider>
            <FutureExpensesProvider>
              <MainLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/analysis" element={<AnalysisPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/installments" element={<InstallmentsPage />} />
                    <Route path="/debts" element={<DebtsPage />} />
                    <Route path="/emergency-reserve" element={<EmergencyReservePage />} />
                    <Route path="/future-expenses" element={<FutureExpensesPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </FutureExpensesProvider>
          </EmergencyReserveProvider>
        </DebtsProvider>
      </InstallmentsProvider>
    </TransactionsProvider>
  </ErrorBoundary>
);

/**
 * Rotas públicas
 */
const PublicRoutes: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
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
  // Boot ok com o bundle atual — libera futuros auto-reloads de chunk obsoleto
  useEffect(() => {
    clearChunkReloadFlag();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <StyledThemeWrapper>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <GlobalStyle />
        </StyledThemeWrapper>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
