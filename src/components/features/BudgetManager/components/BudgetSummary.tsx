/**
 * @file components/features/BudgetManager/components/BudgetSummary.tsx
 * @description Componente de resumo do orçamento mensal.
 * Exibe totais de orçamento, gasto e progresso geral.
 */

import React from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import * as C from './BudgetSummary.styles';

/**
 * Props do componente BudgetSummary
 */
interface BudgetSummaryProps {
  /** Total do orçamento do mês */
  totalBudget: number;
  /** Total gasto no mês */
  totalSpent: number;
}

/**
 * Calcula a porcentagem de uso do orçamento
 * @param budget - Limite total do orçamento
 * @param spent - Valor total gasto
 * @returns Porcentagem de uso (0-100)
 */
const getPercentage = (budget: number, spent: number): number => {
  if (budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
};

/**
 * Retorna a cor baseada na porcentagem de uso
 * @param percentage - Porcentagem de uso
 * @returns Cor hexadecimal
 */
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#10b981';
};

/**
 * Resumo do orçamento mensal
 * @param {BudgetSummaryProps} props - Props do componente
 * @returns {JSX.Element} Resumo renderizado
 *
 * @example
 * <BudgetSummary totalBudget={5000} totalSpent={3200} />
 */
const BudgetSummary: React.FC<BudgetSummaryProps> = ({ totalBudget, totalSpent }) => {
  const percentage = getPercentage(totalBudget, totalSpent);
  const color = getPercentageColor(percentage);
  const remaining = totalBudget - totalSpent;

  return (
    <C.SummaryBar>
      <C.SummaryItem>
        <C.SummaryLabel>Orçamento Total</C.SummaryLabel>
        <C.SummaryValue>{formatCurrency(totalBudget)}</C.SummaryValue>
      </C.SummaryItem>
      <C.SummaryItem>
        <C.SummaryLabel>Total Gasto</C.SummaryLabel>
        <C.SummaryValue $type="expense">{formatCurrency(totalSpent)}</C.SummaryValue>
      </C.SummaryItem>
      <C.SummaryItem>
        <C.SummaryLabel>Disponível</C.SummaryLabel>
        <C.SummaryValue $type={remaining >= 0 ? 'income' : 'expense'}>
          {formatCurrency(remaining)}
        </C.SummaryValue>
      </C.SummaryItem>
      <C.SummaryItem>
        <C.SummaryLabel>Progresso</C.SummaryLabel>
        <C.ProgressBar>
          <C.ProgressFill $percentage={percentage} $color={color} />
        </C.ProgressBar>
        <C.ProgressText>{percentage.toFixed(0)}% utilizado</C.ProgressText>
      </C.SummaryItem>
    </C.SummaryBar>
  );
};

export default BudgetSummary;
