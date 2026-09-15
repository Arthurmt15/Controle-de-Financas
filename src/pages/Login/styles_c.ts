import styled from 'styled-components';

/**
 * Ícone do Google
 */
export const GoogleIcon = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #4285f4;
`;

/**
 * Divisor
 */
export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 28px 0;
`;

/**
 * Linha do divisor
 */
export const DividerLine = styled.span`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
`;

/**
 * Texto do divisor
 */
export const DividerText = styled.small`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

/**
 * Grupo de formulário
 */
export const FormGroup = styled.div`
  margin-bottom: 22px;
`;

/**
 * Label do formulário
 */
export const Label = styled.label`
  display: block;
  margin-bottom: 9px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Input do formulário
 */
export const Input = styled.input`
  width: 100%;
  height: 54px;
  padding: 0 16px;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 9px;
  outline: none;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  transition: 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}1f`};
  }

  @media (max-width: 480px) {
    height: 52px;
  }
`;

/**
 * Wrapper da senha
 */
export const PasswordWrapper = styled.div`
  position: relative;
`;

/**
 * Botão mostrar senha
 */
export const ShowPasswordButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
`;

/**
 * Opções do formulário
 */
export const FormOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  font-size: 13px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

/**
 * Checkbox de lembrar
 */
export const RememberLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Link de esqueceu senha
 */
export const ForgotPassword = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;
