/**
 * @file App.tsx
 * @description Componente raiz da aplicação.
 * Configura providers, rotas e layout principal.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import GlobalStyle from './Styles/global';

/**
 * Rotas protegidas (requer autenticação)
 */
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
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </main>
    </>
  );
};

/**
 * Componente de rotas autenticadas
 */
const AuthenticatedRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

/**
 * Componente de rotas não autenticadas
 */
const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

/**
 * Componente de rotas principal
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AuthenticatedRoutes /> : <PublicRoutes />;
};

/**
 * Componente raiz da aplicação
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <GlobalStyle />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
