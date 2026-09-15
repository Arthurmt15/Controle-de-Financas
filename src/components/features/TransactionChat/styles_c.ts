import styled from 'styled-components';

/**
 * Botão de saída
 */
export const ExpenseButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => `${theme.colors.primary}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}25`};
    border-color: ${({ theme }) => `${theme.colors.primary}50`};
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;

/**
 * Título das dicas
 */
export const TipsTitle = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: block;
  margin-bottom: 6px;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

/**
 * Lista de exemplos
 */
export const ExamplesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

/**
 * Exemplo clicável
 */
export const ExampleChip = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => `${theme.colors.primary}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}20`};
  }

  @media (max-width: 480px) {
    padding: 12px 18px;
    font-size: 14px;
  }
`;

/**
 * Container dos botões de decisão de categoria
 */
export const PendingCategoryActions = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => `${theme.colors.primary}08`};

  @media (max-width: 480px) {
    padding: 14px 16px;
  }
`;

/**
 * Container dos botões de opção
 */
export const PendingCategoryButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

/**
 * Botão para usar "Outros"
 */
export const UseOtherButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;

/**
 * Botão para criar nova categoria
 */
export const CreateCategoryButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: white;
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;
