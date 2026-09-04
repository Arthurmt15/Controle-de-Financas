/**
 * @file components/features/Dashboard/index.tsx
 * @description Dashboard principal com métricas e gráficos financeiros.
 * Composição de sub-componentes: SummaryCards, Charts e TransactionsList.
 * Utiliza o Header global para navegação.
 */

import React from 'react';
import SummaryCards from './SummaryCards';
import Charts from './Charts';
import TransactionsList from './TransactionsList';
import * as C from './styles';

/**
 * Componente Dashboard
 * Composição principal do dashboard financeiro
 * Exibe cards de métricas, gráficos e transações recentes
 */
const Dashboard: React.FC = () => {
  return (
    <C.Container>
      <C.PageHeading>
        <h1>Dashboard Financeiro</h1>
        <p>Visão geral das suas finanças em tempo real</p>
      </C.PageHeading>

      {/* Cards de resumo */}
      <SummaryCards />

      {/* Gráficos */}
      <Charts />

      {/* Transações recentes */}
      <TransactionsList />
    </C.Container>
  );
};

export default Dashboard;
