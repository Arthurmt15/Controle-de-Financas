/**
 * @file components/common/Input/styles.ts
 * @description Estilos do componente Input utilizando styled-components.
 */

import styled, { css } from 'styled-components';

/**
 * Container principal do input
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

/**
 * Label do input
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
  transition: color 0.2s ease;
`;

/**
 * Indicador de campo obrigatório
 */
export const Required = styled.span`
  color: ${({ theme }) => theme.colors.error};
  margin-left: 4px;
`;

/**
 * Wrapper do input
 */
export const InputWrapper = styled.div<{ hasError: boolean; isDisabled: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
`;

/**
 * Input estilizado
 */
export const StyledInput = styled.input<{ hasError: boolean }>`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 2px solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.2s ease-in-out;

  /* Placeholder */
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  /* Hover */
  &:hover:not(:disabled) {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.textSecondary};
  }

  /* Foco */
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, hasError }) =>
      hasError ? `${theme.colors.error}20` : `${theme.colors.primary}20`};
  }

  /* Desabilitado */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

  /* Remove setas do input number */
  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

/**
 * Mensagem de erro
 */
export const ErrorMessage = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  gap: 4px;
`;

/**
 * Texto de ajuda
 */
export const HelperText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
