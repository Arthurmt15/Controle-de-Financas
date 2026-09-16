import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Rota legada /debts — redireciona para a página unificada /installments (Parcelados & Dívidas).
 * Mantém compatibilidade com bookmarks.
 */
const DebtsPage: React.FC = () => {
  return <Navigate to="/installments" replace />;
};

export default DebtsPage;
