/**
 * @file src/components/features/OpenFinance/TransactionList/styles.ts
 * @description Estilos do componente TransactionList.
 * Estilização da lista de transações financeiras.
 */

import styled from 'styled-components';

/** Container da lista de transações */
export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  overflow: hidden;
`;

/** Filtros de data */
export const Filters = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors?.backgroundAlt || '#f9fafb'};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

/** Input de filtro */
export const FilterInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 14px;
    color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
    white-space: nowrap;
  }

  input {
    padding: 8px 12px;
    border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
    border-radius: 6px;
    font-size: 14px;
    background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
    }
  }
`;

/** Item de transação */
export const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors?.backgroundAlt || '#f9fafb'};
  }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

/** Descrição da transação */
export const TransactionDescription = styled.div`
  flex: 1;
  min-width: 0;

  .description {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/** Categoria da transação */
export const TransactionCategory = styled.span`
  display: inline-block;
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin-top: 4px;
`;

/** Valor da transação */
export const TransactionAmount = styled.div<{ isPositive: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ isPositive, theme }) =>
    isPositive ? theme.colors?.success || '#10b981' : theme.colors?.error || '#ef4444'};
  margin: 0 16px;
  white-space: nowrap;

  @media (max-width: 640px) {
    margin: 0;
  }
`;

/** Data da transação */
export const TransactionDate = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  white-space: nowrap;

  @media (max-width: 640px) {
    width: 100%;
    text-align: right;
  }
`;

/** Estado vazio */
export const EmptyState = styled.div`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;

  p {
    color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
    font-size: 16px;
  }
`;

/** Container de carregamento */
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  font-size: 16px;
`;
