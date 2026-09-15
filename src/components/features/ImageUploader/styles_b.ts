import styled from 'styled-components';

/**
 * Área de resultado da análise
 */
export const AnalysisResult = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: ${({ theme }) => `${theme.colors.success}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.success}30`};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

/**
 * Título da análise
 */
export const AnalysisTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

/**
 * Dica de edição
 */
export const EditHint = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`;

/**
 * Campo da análise
 */
export const AnalysisField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.success}20`};

  &:last-child {
    border-bottom: none;
  }
`;

/**
 * Label do campo
 */
export const FieldLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Valor do campo
 */
export const FieldValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Input editável do campo
 */
export const FieldInput = styled.input`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  max-width: 200px;
  text-align: right;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &[type="date"] {
    max-width: 160px;
  }

  &[type="text"] {
    text-align: left;
    max-width: 250px;
  }
`;

/**
 * Select editável do campo
 */
export const FieldSelect = styled.select`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 6px 10px;
  max-width: 250px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Mensagem de erro
 */
export const ErrorMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: ${({ theme }) => `${theme.colors.danger}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.danger}30`};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
`;

/**
 * Container dos botões de tipo
 */
export const TypeButtons = styled.div`
  display: flex;
  gap: 8px;
`;

/**
 * Botão de entrada
 */
export const IncomeButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: ${({ $active }) => ($active ? 'white' : '#22c55e')};
  background-color: ${({ $active }) => ($active ? '#22c55e' : '#22c55e15')};
  border: 1px solid ${({ $active }) => ($active ? '#22c55e' : '#22c55e30')};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? '#16a34a' : '#22c52525')};
  }
`;

/**
 * Botão de saída
 */
export const ExpenseButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: ${({ $active, theme }) => ($active ? 'white' : theme.colors.primary)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : `${theme.colors.primary}15`)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : `${theme.colors.primary}30`)};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active, theme }) => ($active ? theme.colors.primaryDark : `${theme.colors.primary}25`)};
  }
`;
