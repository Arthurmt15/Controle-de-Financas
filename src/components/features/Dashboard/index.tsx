/**
 * @file components/features/Dashboard/index.tsx
 * @description Dashboard principal com métricas e gráficos financeiros.
 * Composição de sub-componentes: Sidebar, TopBar, SummaryCards, Charts e TransactionsList.
 * Layout baseado no design dark theme do assets/financas-dashboard.
 */

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SummaryCards from './SummaryCards';
import Charts from './Charts';
import TransactionsList from './TransactionsList';
import * as C from './styles';

/**
 * Componente Dashboard
 * Composição principal do dashboard financeiro
 * Exibe sidebar, topbar, cards de métricas, gráficos e transações
 */
const Dashboard: React.FC = () => {
  return (
    <C.AppLayout>
      {/* Sidebar com navegação e controles */}
      <Sidebar activeRoute="/dashboard" />

      {/* Conteúdo principal */}
      <C.MainContent>
        {/* Barra superior */}
        <TopBar />

        {/* Conteúdo do dashboard */}
        <C.Content>
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
        </C.Content>
      </C.MainContent>
    </C.AppLayout>
  );
};

export default Dashboard;
