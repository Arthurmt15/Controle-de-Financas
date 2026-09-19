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
  color: ${({ $isUser, theme }) => ($isUser ? 'white' : theme.colors.text)};
  border: ${({ $isUser, theme }) => ($isUser ? 'none' : `1px solid ${theme.colors.border}`)};
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
