/**
 * @file pages/Dashboard/index.tsx
 * @description Página principal do Dashboard.
 * Exibe métricas, gráficos e resumo financeiro.
 */

import React from 'react';
import DashboardComponent from '../../components/features/Dashboard';
import * as C from './styles';

/**
 * Página do Dashboard
 * @returns {JSX.Element} Página renderizada
 *
 * @example
 * <DashboardPage />
 */
const DashboardPage: React.FC = () => {
  return (
    <C.Container>
      <DashboardComponent />
    </C.Container>
  );
};

export default DashboardPage;
