/**
 * @file components/features/Dashboard/index.tsx
 * @description Dashboard principal com métricas e gráficos financeiros.
 * Redesenhado em shadcn + tailwind + framer-motion (referência: Installments bento).
 * Sub-componentes: SummaryCards, Charts, TransactionsList e OpenFinanceSummary.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import SummaryCards from './SummaryCards';
import Charts from './Charts';
import TransactionsList from './TransactionsList';
import OpenFinanceSummary from './OpenFinanceSummary';

/** Dashboard bento moderno com heading em gradiente e stagger suave */
const Dashboard: React.FC = () => {
  // Data localizada para o HeadingMeta
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho bento — título com gradiente e meta pill */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div className="min-w-0">
            {/* Título com gradiente sutil (igual Installments) */}
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Seu dinheiro, nítido.
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[520px] leading-relaxed">
              Bento financeiro — saldo, fluxo e próximos passos em um só lugar.
            </p>
          </div>
          {/* Pill de data/atualização */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground px-3 py-2 rounded-full border bg-card shadow-sm whitespace-nowrap shrink-0">
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            <span className="capitalize">{todayLabel}</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 opacity-60" />
              Atualizado agora
            </span>
          </div>
        </div>
      </motion.div>

      {/* KPIs — stagger */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
        <SummaryCards />
      </motion.div>

      {/* Linha gráficos + resumo Open Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="lg:col-span-2 min-w-0"
        >
          <Charts />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="min-w-0">
          <OpenFinanceSummary />
        </motion.div>
      </div>

      {/* Transações recentes */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }} className="mt-4">
        <TransactionsList />
      </motion.div>
    </div>
  );
};

export default Dashboard;
