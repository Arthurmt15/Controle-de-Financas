/**
 * @file components/features/BudgetManager/components/BudgetSummary.styles.ts
 * @description Estilos do componente de resumo do orçamento.
 */

import styled from 'styled-components';

/** Barra de resumo com grid responsivo */
export const SummaryBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

/** Item do resumo */
export const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/** Label do item */
export const SummaryLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** Valor do item */
export const SummaryValue = styled.span<{ $type?: 'income' | 'expense' }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme, $type }) =>
    $type === 'income'
      ? theme.colors.success
      : $type === 'expense'
      ? theme.colors.error
      : theme.colors.text};
`;

/** Barra de progresso */
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

/** Preenchimento da barra de progresso */
export const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  width: ${({ $percentage }) => $percentage}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

/** Texto do progresso */
export const ProgressText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
