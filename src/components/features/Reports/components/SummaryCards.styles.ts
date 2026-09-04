/**
 * @file components/features/Reports/components/SummaryCards.styles.ts
 * @description Estilos dos cards de resumo financeiro.
 */

import styled from 'styled-components';

/** Grid responsivo dos cards de resumo */
export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/** Card de resumo com borda lateral colorida */
export const SummaryCard = styled.div<{ $type: 'income' | 'expense' }>`
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 4px solid ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
`;

/** Label do card */
export const SummaryLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

/** Valor do card */
export const SummaryValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;
