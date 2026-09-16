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
import { InstallmentsProvider } from './contexts/InstallmentsContext';
import { DebtsProvider } from './contexts/DebtsContext';
import { FutureExpensesProvider } from './contexts/FutureExpensesContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import styled from 'styled-components';
import Header from './components/layout/Header';
import SkipLink from './components/common/SkipLink';
import FloatingChat from './components/features/FloatingChat';
import GlobalStyle from './Styles/global';

const Main = styled.main`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

// Lazy loading das páginas (code splitting)
const LoginPage = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const TransactionsPage = lazy(() => import('./pages/Transactions'));
const AnalysisPage = lazy(() => import('./pages/Analysis'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const InstallmentsPage = lazy(() => import('./pages/Installments'));
const DebtsPage = lazy(() => import('./pages/Debts'));
const FutureExpensesPage = lazy(() => import('./pages/FutureExpenses'));

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
  <TransactionsProvider>
    <InstallmentsProvider>
      <DebtsProvider>
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
                <Route path="/future-expenses" element={<FutureExpensesPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </FutureExpensesProvider>
      </DebtsProvider>
    </InstallmentsProvider>
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
