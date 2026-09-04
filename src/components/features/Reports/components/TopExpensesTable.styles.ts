/**
 * @file components/features/Reports/components/TopExpensesTable.styles.ts
 * @description Estilos da tabela de maiores despesas.
 */

import styled from 'styled-components';

/** Card da tabela */
export const TableCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/** Título da tabela */
export const TableTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

/** Tabela HTML */
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

/** Cabeçalho da tabela */
export const Thead = styled.thead`
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

/** Corpo da tabela */
export const Tbody = styled.tbody``;

/** Linha da tabela */
export const Tr = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

/** Cabeçalho da coluna */
export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/** Célula da tabela */
export const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

/** Valor da despesa */
export const ExpenseValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.error};
`;

/** Badge de categoria */
export const CategoryBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${({ $color }) => $color};
  border-radius: 12px;
`;

/** Linha vazia */
export const EmptyRow = styled.tr``;

/** Célula vazia */
export const EmptyCell = styled.td`
  text-align: center;
  padding: 40px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
