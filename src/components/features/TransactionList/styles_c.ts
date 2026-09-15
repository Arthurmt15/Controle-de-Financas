import styled from 'styled-components';

/**
 * Container dos cards mobile
 * Só aparece em telas pequenas
 */
export const MobileCards = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

/**
 * Card individual de transação mobile
 * Layout compacto em 2 linhas
 */
export const MobileCard = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

/**
 * Linha superior do card (descrição + valor)
 */
export const MobileCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

/**
 * Descrição no card mobile
 */
export const MobileCardDescription = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  margin-right: 12px;

  span {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/**
 * Valor no card mobile
 */
export const MobileCardAmount = styled.span<{ $type: 'income' | 'expense' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
  white-space: nowrap;
`;

/**
 * Linha inferior do card (categoria + data + ações)
 */
export const MobileCardBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

/**
 * Info da linha inferior (categoria + data)
 */
export const MobileCardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

/**
 * Data no card mobile
 */
export const MobileCardDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

/**
 * Badge de categoria mobile (menor)
 */
export const MobileCategoryBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  background-color: ${({ $color }) => $color};
  border-radius: 10px;
  white-space: nowrap;
`;

/**
 * Ações no card mobile
 */
export const MobileCardActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

/**
 * Botão de ação mobile (menor)
 */
export const MobileActionButton = styled.button<{ $variant?: 'default' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
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
 * Mensagem vazia mobile
 */
export const MobileEmptyMessage = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
