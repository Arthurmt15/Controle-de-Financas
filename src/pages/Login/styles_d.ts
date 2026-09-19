import styled from 'styled-components';

/**
 * Botão de login
 */
export const LoginButton = styled.button`
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primaryHover},
    ${({ theme }) => theme.colors.primary}
  );
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px ${({ theme }) => `${theme.colors.primary}59`};
  }

  @media (max-width: 480px) {
    height: 52px;
  }
`;

/**
 * Link de registro
 */
export const RegisterLink = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      color: ${({ theme }) => theme.colors.text};
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
  }
`;

/**
 * Mensagem de erro
 */
export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: ${({ theme }) => `${theme.colors.error}15`};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
`;

/**
 * Ícone de erro
 */
export const ErrorIcon = styled.span`
  font-size: 16px;
`;

/**
 * Botão de fechar erro
 */
export const ErrorClose = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }
`;

/**
 * Container do botão Google (renderizado pelo Google)
 */
export const GoogleButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  > div {
    width: 100% !important;

    > div {
      width: 100% !important;
    }
  }
`;
