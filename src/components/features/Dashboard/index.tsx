/**
 * @file components/features/Dashboard/index.tsx
 * @description Dashboard principal com métricas e gráficos financeiros.
 * Composição de sub-componentes: SummaryCards, Charts e TransactionsList.
 * Utiliza o Header global para navegação.
 */

import React from 'react';
import { motion } from 'framer-motion';
import SummaryCards from './SummaryCards';
import Charts from './Charts';
import TransactionsList from './TransactionsList';
import OpenFinanceSummary from './OpenFinanceSummary';
import * as C from './styles';

/**
 * Dashboard bento moderno com motion e hierarquia clara.
 * Foco em conversão: KPIs visíveis, gráficos com contexto, ações rápidas.
 */
const Dashboard: React.FC = () => {
  return (
    <C.Container>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <C.PageHeading>
          <div>
            <h1>Seu dinheiro, nítido.</h1>
            <p>Bento financeiro — saldo, fluxo e próximos passos em um só lugar.</p>
          </div>
          <C.HeadingMeta>
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
            <span className="hidden sm:inline">•</span>
            <span>Atualizado agora</span>
          </C.HeadingMeta>
        </C.PageHeading>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <SummaryCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="lg:col-span-2">
          <Charts />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <OpenFinanceSummary />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
        <TransactionsList />
      </motion.div>
    </C.Container>
  );
};

export default Dashboard;
