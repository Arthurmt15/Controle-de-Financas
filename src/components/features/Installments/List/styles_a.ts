/**
 * @file components/features/Installments/List/styles.ts
 * @description Estilos da lista de compras parceladas.
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
  margin: 0;
`;

/** Grid de cards */
export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  padding: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

/** Card do parcelado */
export const Card = styled.div<{ $isCompleted: boolean }>`
  background-color: ${({ theme }) => theme.colors?.backgroundAlt || '#f9fafb'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 16px;
  opacity: ${({ $isCompleted }) => ($isCompleted ? 0.7 : 1)};
`;

/** Cabeçalho do card */
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

/** Descrição do card */
export const CardDescription = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
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

/** Ações do card */
export const CardActions = styled.div`
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

/** Informações do card */
export const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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
