/**
 * @file components/features/TransactionForm/styles.ts
 * @description Estilos do componente TransactionForm.
 */

import styled from 'styled-components';

/**
 * Container do formulário
 */
export const Form = styled.form`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Título do formulário
 */
export const FormTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 20px 0;
`;

/**
 * Seletor de tipo (entrada/saída)
 */
export const TypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

/**
 * Botão de tipo
 */
export const TypeButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $isActive }) => ($isActive ? 'white' : theme.colors.text)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Container dos campos do formulário
 */
export const FieldsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Container do textarea
 */
export const TextareaContainer = styled.div`
  grid-column: 1 / -1;
`;

/**
 * Label do textarea
 */
export const TextareaLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  display: block;
  margin-bottom: 6px;
`;

/**
 * Textarea estilizado
 */
export const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
`;

/**
 * Container dos botões de ação
 */
export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
