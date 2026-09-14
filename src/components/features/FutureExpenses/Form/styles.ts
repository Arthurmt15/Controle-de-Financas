/**
 * @file components/features/FutureExpenses/Form/styles.ts
 * @description Estilos do formulário de despesas futuras.
 */

import styled from 'styled-components';

/** Container do formulário */
export const Form = styled.form`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 24px;
`;

/** Título do formulário */
export const FormTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin-bottom: 20px;
`;

/** Container dos campos */
export const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/** Container do textarea */
export const TextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

/** Label do textarea */
export const TextareaLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text || '#374151'};
`;

/** Textarea */
export const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  }
`;

/** Container dos botões de ação */
export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;
