/**
 * @file components/common/Button/styles.ts
 * @description Estilos do componente Button utilizando styled-components.
 * Define variantes visuais, tamanhos e estados do botão.
 */

import styled, { css, keyframes } from 'styled-components';
import type { ButtonProps } from '../../../types';

/**
 * Animação de rotação para o spinner
 */
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Mapeamento de variantes para cores
 */
const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  secondary: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.error};
    color: white;

    &:hover:not(:disabled) {
      background-color: #dc2626;
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
    }
  `,
};

/**
 * Mapeamento de tamanhos
 */
const sizeStyles = {
  sm: css`
    padding: 6px 12px;
    font-size: 12px;
    gap: 4px;
  `,
  md: css`
    padding: 10px 20px;
    font-size: 14px;
    gap: 8px;
  `,
  lg: css`
    padding: 14px 28px;
    font-size: 16px;
    gap: 10px;
  `,
};

/**
 * Container principal do botão
 */
export const Container = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  /* Aplica estilos baseados na variante */
  ${({ variant = 'primary' }) => variantStyles[variant]}

  /* Aplica estilos baseados no tamanho */
  ${({ size = 'md' }) => sizeStyles[size]}

  /* Estado desabilitado */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Estado de foco para acessibilidade */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}40;
  }

  /* Remove outline do mouse, mantém no teclado */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

/**
 * Wrapper do ícone
 */
export const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;

  ${({ position }) =>
    position === 'left' &&
    css`
      margin-right: 2px;
    `}

  ${({ position }) =>
    position === 'right' &&
    css`
      margin-left: 2px;
    `}
`;

/**
 * Texto do botão
 */
export const Text = styled.span`
  display: inline-block;
`;

/**
 * Spinner de carregamento
 */
export const Spinner = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${spin} 1s linear infinite;

  svg {
    width: 1em;
    height: 1em;
  }
`;
