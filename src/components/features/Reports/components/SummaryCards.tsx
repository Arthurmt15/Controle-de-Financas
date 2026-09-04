/**
 * @file components/features/Reports/components/SummaryCards.tsx
 * @description Cards de resumo financeiro para a página de relatórios.
 * Exibe total de entradas, saídas e saldo do período selecionado.
 */

import React from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import * as C from './SummaryCards.styles';

/**
 * Props do componente SummaryCards
 */
interface SummaryCardsProps {
  /** Total de entradas no período */
  income: number;
  /** Total de saídas no período */
  expense: number;
  /** Saldo do período (entradas - saídas) */
  balance: number;
}

/**
 * Cards de resumo financeiro
 * @param {SummaryCardsProps} props - Props do componente
 * @returns {JSX.Element} Cards de resumo renderizados
 *
 * @example
 * <SummaryCards income={5000} expense={3000} balance={2000} />
 */
const SummaryCards: React.FC<SummaryCardsProps> = ({ income, expense, balance }) => {
  return (
    <C.SummaryGrid>
      <C.SummaryCard $type="income">
        <C.SummaryLabel>Total Entradas</C.SummaryLabel>
        <C.SummaryValue>{formatCurrency(income)}</C.SummaryValue>
      </C.SummaryCard>
      <C.SummaryCard $type="expense">
        <C.SummaryLabel>Total Saídas</C.SummaryLabel>
        <C.SummaryValue>{formatCurrency(expense)}</C.SummaryValue>
      </C.SummaryCard>
      <C.SummaryCard $type={balance >= 0 ? 'income' : 'expense'}>
        <C.SummaryLabel>Saldo</C.SummaryLabel>
        <C.SummaryValue>{formatCurrency(balance)}</C.SummaryValue>
      </C.SummaryCard>
    </C.SummaryGrid>
  );
};

export default SummaryCards;
