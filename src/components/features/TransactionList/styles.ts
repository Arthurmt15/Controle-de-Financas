/**
 * @file components/features/TransactionList/styles.ts
 * @description Estilos do componente TransactionList.
 */

import styled from 'styled-components';

/**
 * Container principal
 */
export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Cabeçalho
 */
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

/**
 * Título
 */
export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/**
 * Botões de exportação
 */
export const ExportButtons = styled.div`
  display: flex;
  gap: 8px;
`;

/**
 * Botão de exportação
 */
export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Filtros
 */
export const Filters = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

/**
 * Input de busca
 */
export const SearchInput = styled.input`
  padding: 10px 16px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  min-width: 200px;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Select de filtro
 */
export const FilterSelect = styled.select`
  padding: 10px 32px 10px 16px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Wrapper da tabela
 */
export const TableWrapper = styled.div`
  overflow-x: auto;
`;

/**
 * Tabela
 */
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

/**
 * Thead
 */
export const Thead = styled.thead`
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

/**
 * Tbody
 */
export const Tbody = styled.tbody``;

/**
 * Tr
 */
export const Tr = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

/**
 * Th
 */
export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Td
 */
export const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

/**
 * Descrição da transação
 */
export const Description = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

/**
 * Indicador de tipo
 */
export const TypeIndicator = styled.span<{ $type: 'income' | 'expense' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
`;

/**
 * Valor da transação
 */
export const Amount = styled.span<{ $type: 'income' | 'expense' }>`
  font-weight: 600;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
`;

/**
 * Badge de categoria
 */
export const CategoryBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${({ $color }) => $color};
  border-radius: 12px;
`;

/**
 * Ações
 */
export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

/**
 * Botão de ação
 */
export const ActionButton = styled.button<{ $variant?: 'default' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $variant }) =>
    $variant === 'danger' ? `${theme.colors.error}10` : theme.colors.surfaceHover};
  color: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.error : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.error : theme.colors.primary};
    color: white;
  }
`;

/**
 * Linha vazia
 */
export const EmptyRow = styled.tr``;

/**
 * Célula vazia
 */
export const EmptyCell = styled.td`
  text-align: center;
  padding: 40px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Confirmação de exclusão
 */
export const DeleteConfirmation = styled.div`
  text-align: center;

  p {
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.colors.text};

    &:last-of-type {
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: 14px;
    }
  }
`;

/**
 * Ações de exclusão
 */
export const DeleteActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

/**
 * Botão de exclusão
 */
export const DeleteButton = styled.button<{ $variant: 'ghost' | 'danger' }>`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ theme, $variant }) =>
    $variant === 'ghost'
      ? `
    background-color: transparent;
    color: ${theme.colors.text};
    border: 2px solid ${theme.colors.border};

    &:hover {
      background-color: ${theme.colors.surfaceHover};
    }
  `
      : `
    background-color: ${theme.colors.error};
    color: white;

    &:hover {
      background-color: #dc2626;
    }
  `}
`;
