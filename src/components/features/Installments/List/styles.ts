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
    $type === 'income'
      ? theme.colors?.success || '#10b981'
      : theme.colors?.error || '#ef4444'};
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

/** Data do card */
export const CardDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

/** Container da barra de progresso */
export const ProgressContainer = styled.div`
  margin-bottom: 12px;
`;

/** Barra de progresso */
export const ProgressBar = styled.div`
  height: 6px;
  background-color: ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
`;

/** Preenchimento da barra */
export const ProgressFill = styled.div<{ $progress: number; $isCompleted: boolean }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: ${({ $isCompleted, theme }) =>
    $isCompleted
      ? theme.colors?.success || '#10b981'
      : theme.colors?.primary || '#6366f1'};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

/** Texto do progresso */
export const ProgressText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  text-align: right;
`;

/** Container dos valores */
export const CardAmounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

/** Linha de valor */
export const AmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};

  strong {
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    font-weight: 600;
  }
`;

/** Próximo pagamento - destaque moderno */
export const NextDue = styled.div<{ $days: number }>`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $days }) =>
      $days < 0
        ? '#fecaca'
        : $days === 0
          ? '#fde68a'
          : $days <= 7
            ? '#bfdbfe'
            : '#e5e7eb'};
  background: ${({ $days }) =>
    $days < 0
      ? '#fef2f2'
      : $days === 0
        ? '#fffbeb'
        : $days <= 7
          ? '#eff6ff'
          : '#f9fafb'};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NextDueLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

export const NextDueDate = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
`;

export const NextDueDays = styled.span<{ $overdue?: boolean }>`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

/** Badge do Open Finance */
export const OpenFinanceBadge = styled.div`
  display: inline-block;
  margin-top: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  background-color: ${({ theme }) => theme.colors?.primaryLight || '#eef2ff'};
  border-radius: 6px;
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
    margin: 8px 0;
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
