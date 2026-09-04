/**
 * @file components/features/BudgetManager/components/BudgetForm.styles.ts
 * @description Estilos do formulário de orçamento.
 */

import styled from 'styled-components';

/** Cabeçalho com título e botão */
export const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

/** Título da seção */
export const BudgetTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/** Container do formulário */
export const AddForm = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 20px;
  margin-bottom: 20px;
`;

/** Título do formulário */
export const FormTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

/** Campos do formulário */
export const FormFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

/** Grupo de campo */
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

/** Label do campo */
export const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** Select do formulário */
export const FormSelect = styled.select`
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Input do formulário */
export const FormInput = styled.input`
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/** Mensagem de erro */
export const ErrorMessage = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.error};
  margin: 0 0 12px 0;
`;

/** Ações do formulário */
export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
