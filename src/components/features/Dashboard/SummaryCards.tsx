/**
 * @file components/features/Dashboard/SummaryCards.tsx
 * @description Componente de cards de resumo do Dashboard.
 * Exibe métricas de entradas, saídas, saldo mensal e anual.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CalendarDays, MoreHorizontal } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency } from '../../../utils/formatters';
import * as C from './styles';

/**
 * Componente SummaryCards
 * Exibe 4 cards com métricas financeiras principais
 */
const SummaryCards: React.FC = () => {
  const { metrics } = useTransactions();

  /**
   * Calcula a variação percentual entre dois valores
   * @param {number} current - Valor atual
   * @param {number} previous - Valor anterior
   * @returns {string} Percentual formatado com sinal
   */
  const getVariation = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const variation = ((current - previous) / previous) * 100;
    return `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
  };

  /** Dados dos cards com ícones Lucide distintivos */
  const cards = useMemo(() => [
    {
      variant: 'income' as const,
      Icon: TrendingUp,
      label: 'Entradas do Mês',
      value: formatCurrency(metrics.monthlyIncome),
      subtext: getVariation(metrics.monthlyIncome, metrics.averageMonthlyIncome),
      tone: 'emerald' as const,
    },
    {
      variant: 'expense' as const,
      Icon: TrendingDown,
      label: 'Saídas do Mês',
      value: formatCurrency(metrics.monthlyExpense),
      subtext: getVariation(metrics.monthlyExpense, metrics.averageMonthlyExpense),
      tone: 'rose' as const,
    },
    {
      variant: 'balance' as const,
      Icon: Wallet,
      label: 'Saldo do Mês',
      value: formatCurrency(metrics.monthlyBalance),
      subtext: metrics.monthlyBalance >= 0 ? 'Fluxo positivo' : 'Atenção ao fluxo',
      tone: 'violet' as const,
    },
    {
      variant: 'annual' as const,
      Icon: CalendarDays,
      label: 'Saldo Anual',
      value: formatCurrency(metrics.yearlyBalance),
      subtext: `Acumulado ${new Date().getFullYear()}`,
      tone: 'slate' as const,
    },
  ], [metrics]);

  return (
    <C.SummaryGrid>
      {cards.map(({ variant, Icon, label, value, subtext, tone }, idx) => (
        <motion.div key={variant} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
          <C.SummaryCard $tone={tone}>
            <C.SummaryIcon $tone={tone}><Icon size={16} /></C.SummaryIcon>
            <div style={{ minWidth: 0, flex: 1 }}>
              <C.SummaryLabel>{label}</C.SummaryLabel>
              <C.SummaryValue>{value}</C.SummaryValue>
              <C.SummarySubtext $tone={tone}>{subtext}</C.SummarySubtext>
            </div>
            <C.DotsButton aria-label="mais"><MoreHorizontal size={14} /></C.DotsButton>
          </C.SummaryCard>
        </motion.div>
      ))}
    </C.SummaryGrid>
  );
};

export default SummaryCards;
