/**
 * @file components/features/TransactionChat/styles.ts
 * @description Estilos do componente TransactionChat.
 */

import styled from 'styled-components';

/**
 * Container principal do chat
 */
export const ChatContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 450px;

  @media (max-width: 480px) {
    min-height: 70vh;
  }
`;

/**
 * Cabeçalho do chat
 */
export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};

  @media (max-width: 480px) {
    padding: 14px 16px;
  }
`;

/**
 * Título do chat
 */
export const ChatTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

/**
 * Ícone do título
 */
export const TitleIcon = styled.span`
  font-size: 20px;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

/**
 * Área de mensagens
 */
export const MessagesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
  min-height: 200px;

  @media (max-width: 480px) {
    padding: 16px;
    max-height: none;
    min-height: 350px;
    flex: 1 1 0;
  }
`;

/**
 * Mensagem individual
 */
export const Message = styled.div<{ $isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
  gap: 4px;
`;

/**
 * Balão da mensagem
 */
export const MessageBubble = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
  background-color: ${({ $isUser, theme }) =>
    $isUser ? theme.colors.primary : theme.colors.surface};
  color: ${({ $isUser, theme }) =>
    $isUser ? 'white' : theme.colors.text};
  border: ${({ $isUser, theme }) =>
    $isUser ? 'none' : `1px solid ${theme.colors.border}`};
  word-break: break-word;

  @media (max-width: 480px) {
    max-width: 88%;
    padding: 12px 16px;
    font-size: 15px;
  }
`;

/**
 * Timestamp da mensagem
 */
export const MessageTime = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0 4px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

/**
 * Mensagem de transação criada
 */
export const TransactionCreated = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  background-color: ${({ theme }) => `${theme.colors.success}15`};
  color: ${({ theme }) => theme.colors.success};
  border: 1px solid ${({ theme }) => `${theme.colors.success}30`};

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 15px;
  }
`;

/**
 * Ícone de sucesso
 */
export const SuccessIcon = styled.span`
  font-size: 16px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

/**
 * Container do input
 */
export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};

  @media (max-width: 480px) {
    gap: 10px;
    padding: 14px 16px;
  }
`;

/**
 * Input de mensagem
 */
export const MessageInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 16px;
  }
`;

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
