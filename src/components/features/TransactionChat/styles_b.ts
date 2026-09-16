import styled from 'styled-components';

/**
 * Botão de enviar
 */
export const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 46px;
    height: 46px;
    min-width: 46px;
  }
`;

/**
 * Ícone de enviar
 */
export const SendIcon = styled.span`
  font-size: 18px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

/**
 * Dicas de uso
 */
export const TipsContainer = styled.div`
  padding: 12px 16px;
  background-color: ${({ theme }) => `${theme.colors.primary}08`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 480px) {
    padding: 16px;
  }
`;
