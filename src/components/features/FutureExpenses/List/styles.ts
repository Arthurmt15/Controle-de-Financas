/**
 * @file components/features/FutureExpenses/List/styles.ts
 * @description Estilos da lista de despesas futuras.
 */

import styled from 'styled-components';

/** Container da lista */
export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  overflow: hidden;
`;

/** Cabeçalho */
export const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

/** Título */
export const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin: 0 0 12px 0;
`;

/** Resumo de valores */
export const Summary = styled.div`
  display: flex;
  gap: 24px;
`;

/** Item do resumo */
export const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};

  strong {
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    font-weight: 600;
  }
`;

/** Abas */
export const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

/** Aba individual */
export const Tab = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors?.primary || '#6366f1' : theme.colors?.textSecondary || '#6b7280'};
  border-bottom: 2px solid
    ${({ $isActive, theme }) => ($isActive ? theme.colors?.primary || '#6366f1' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  }
`;

/** Lista */
export const List = styled.div`
  display: flex;
  flex-direction: column;
`;

/** Item da lista */
export const ListItem = styled.div<{ $isUrgent: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  background-color: ${({ $isUrgent }) => ($isUrgent ? '#fffbeb' : 'transparent')};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ $isUrgent, theme }) =>
      $isUrgent ? '#fef3c7' : theme.colors?.backgroundAlt || '#f9fafb'};
  }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 12px;
  }
`;

/** Informações do item */
export const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

/** Descrição do item */
export const ItemDescription = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
`;

/** Indicador de tipo */
export const TypeIndicator = styled.div<{ $type: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $type, theme }) =>
    $type === 'income' ? theme.colors?.success || '#10b981' : theme.colors?.error || '#ef4444'};
`;

/** Detalhes do item */
export const ItemDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

/** Badge de categoria */
export const CategoryBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${({ $color }) => $color};
  border-radius: 12px;
`;

/** Data do item */
export const ItemDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

/** Dias até vencimento */
export const DaysUntil = styled.span<{ $isUrgent: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${({ $isUrgent, theme }) =>
    $isUrgent ? theme.colors?.error || '#ef4444' : theme.colors?.textSecondary || '#6b7280'};
`;

/** Valor do item */
export const ItemAmount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin: 0 16px;
  white-space: nowrap;

  @media (max-width: 640px) {
    margin: 0;
  }
`;

/** Ações do item */
export const ItemActions = styled.div`
  display: flex;
  gap: 4px;
`;

/** Botão de ação */
export const ActionButton = styled.button<{ $variant?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  color: ${({ $variant, theme }) =>
    $variant === 'danger'
      ? theme.colors?.error || '#ef4444'
      : theme.colors?.textSecondary || '#6b7280'};

  &:hover {
    background-color: ${({ $variant, theme }) =>
      $variant === 'danger' ? '#fef2f2' : theme.colors?.background || '#f3f4f6'};
  }
`;

/** Estado vazio */
export const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;

  p {
    color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
    font-size: 16px;
    margin: 0;
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

/** Confirmação de exclusão */
export const DeleteConfirmation = styled.div`
  text-align: center;
  padding: 16px;

  p {
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    font-size: 16px;
    margin: 8px 0;
  }

  p:last-of-type {
    font-size: 14px;
    color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  }
`;

/** Ações de exclusão */
export const DeleteActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

/** Botão de exclusão */
export const DeleteButton = styled.button<{ $variant: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.colors?.error || '#ef4444' : 'transparent'};
  color: ${({ $variant, theme }) =>
    $variant === 'danger' ? 'white' : theme.colors?.textSecondary || '#6b7280'};

  &:hover {
    opacity: 0.9;
  }
`;
