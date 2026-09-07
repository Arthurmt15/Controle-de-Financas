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
`;

/**
 * Cabeçalho do chat
 */
export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
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
`;

/**
 * Ícone do título
 */
export const TitleIcon = styled.span`
  font-size: 20px;
`;

/**
 * Área de mensagens
 */
export const MessagesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
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
`;

/**
 * Timestamp da mensagem
 */
export const MessageTime = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0 4px;
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
`;

/**
 * Ícone de sucesso
 */
export const SuccessIcon = styled.span`
  font-size: 16px;
`;

/**
 * Container do input
 */
export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

/**
 * Input de mensagem
 */
export const MessageInput = styled.input`
  flex: 1;
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
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Ícone de enviar
 */
export const SendIcon = styled.span`
  font-size: 18px;
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
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }
`;

/**
 * Ícone de upload
 */
export const UploadIcon = styled.span`
  font-size: 18px;
`;

/**
 * Dicas de uso
 */
export const TipsContainer = styled.div`
  padding: 12px 16px;
  background-color: ${({ theme }) => `${theme.colors.primary}08`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
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
`;

/**
 * Lista de exemplos
 */
export const ExamplesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

/**
 * Exemplo clicável
 */
export const ExampleChip = styled.button`
  padding: 4px 10px;
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
`;
