import styled from 'styled-components';

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
      background-color: ${theme.colors.primaryHover};
    }
  `}
`;
