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
 * Botão de upload de imagem
 */
export const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }

  @media (max-width: 480px) {
    width: 46px;
    height: 46px;
    min-width: 46px;
  }
`;

/**
 * Ícone de upload
 */
export const UploadIcon = styled.span`
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

/**
 * Container do formulário de comprovante editável
 */
export const ReceiptForm = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => `${theme.colors.primary}08`};

  @media (max-width: 480px) {
    padding: 14px 16px;
  }
`;

/**
 * Linha do formulário
 */
export const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 12px;
  }
`;

/**
 * Label do campo
 */
export const FormLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 70px;

  @media (max-width: 480px) {
    min-width: auto;
    font-size: 13px;
  }
`;

/**
 * Input do formulário
 */
export const FormInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  font-size: 13px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px;
  }
`;

/**
 * Select do formulário
 */
export const FormSelect = styled.select`
  flex: 1;
  padding: 6px 10px;
  font-size: 13px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px;
  }
`;

/**
 * Container dos botões de tipo (entrada/saída)
 */
export const TypeButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

/**
 * Botão de entrada
 */
export const IncomeButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #22c55e;
  background-color: #22c55e15;
  border: 1px solid #22c55e30;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #22c55e25;
    border-color: #22c55e50;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;
