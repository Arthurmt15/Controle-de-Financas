import styled from 'styled-components';

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
