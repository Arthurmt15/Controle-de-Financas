/**
 * @file components/features/Dashboard/SummaryCards.tsx
 * @description Componente de cards de resumo do Dashboard.
 * Exibe métricas de entradas, saídas, saldo mensal e anual.
 */

import React, { useMemo } from 'react';
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

  /** Dados dos cards de resumo */
  const cards = useMemo(() => [
    {
      variant: 'income' as const,
      icon: '↗',
      label: 'Entradas do Mês',
      value: formatCurrency(metrics.monthlyIncome),
      subtext: getVariation(metrics.monthlyIncome, metrics.averageMonthlyIncome),
    },
    {
      variant: 'expense' as const,
      icon: '↘',
      label: 'Saídas do Mês',
      value: formatCurrency(metrics.monthlyExpense),
      subtext: getVariation(metrics.monthlyExpense, metrics.averageMonthlyExpense),
    },
    {
      variant: 'balance' as const,
      icon: '$',
      label: 'Saldo do Mês',
      value: formatCurrency(metrics.monthlyBalance),
      subtext: metrics.monthlyBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo',
    },
    {
      variant: 'annual' as const,
      icon: '📅',
      label: 'Saldo Anual',
      value: formatCurrency(metrics.yearlyBalance),
      subtext: `Ano ${new Date().getFullYear()}`,
    },
  ], [metrics]);

  return (
    <C.SummaryGrid>
      {cards.map((card) => (
        <C.SummaryCard key={card.variant}>
          <C.SummaryIcon $variant={card.variant}>{card.icon}</C.SummaryIcon>
          <div>
            <C.SummaryLabel>{card.label}</C.SummaryLabel>
            <C.SummaryValue>{card.value}</C.SummaryValue>
            <C.SummarySubtext>{card.subtext}</C.SummarySubtext>
          </div>
          <C.DotsButton>⋯</C.DotsButton>
        </C.SummaryCard>
      ))}
    </C.SummaryGrid>
  );
};

export default SummaryCards;
