/**
 * @file components/common/Select/styles.ts
 * @description Estilos do componente Select.
 */

import styled from 'styled-components';

/**
 * Container principal
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

/**
 * Label do select
 */
export const Label = styled.label<{
  hasError: boolean;
  isRequired: boolean;
  isDisabled: boolean;
}>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme, hasError, isDisabled }) =>
    isDisabled
      ? theme.colors.placeholder
      : hasError
      ? theme.colors.error
      : theme.colors.text};
`;

/**
 * Indicador de obrigatório
 */
export const Required = styled.span`
  color: ${({ theme }) => theme.colors.error};
  margin-left: 4px;
`;

/**
 * Wrapper do select
 */
export const SelectWrapper = styled.div<{ hasError: boolean; isDisabled: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
`;

/**
 * Select estilizado
 */
export const StyledSelect = styled.select<{ hasError: boolean }>`
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 2px solid ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, hasError }) =>
      hasError ? `${theme.colors.error}20` : `${theme.colors.primary}20`};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

/**
 * Ícone de opção
 */
export const Option = styled.option``;

/**
 * Ícone de seta
 */
export const ArrowIcon = styled.span`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

/**
 * Mensagem de erro
 */
export const ErrorMessage = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;
