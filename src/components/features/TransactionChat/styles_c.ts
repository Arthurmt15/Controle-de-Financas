import styled from 'styled-components';

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
