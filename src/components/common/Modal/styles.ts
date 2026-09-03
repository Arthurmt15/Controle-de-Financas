/**
 * @file components/common/Modal/styles.ts
 * @description Estilos do componente Modal utilizando styled-components.
 */

import styled, { keyframes, css } from 'styled-components';
import type { ModalProps } from '../../../types';

/**
 * Animação de fade in para o overlay
 */
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Animação de slide up para o modal
 */
const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

/**
 * Mapeamento de tamanhos
 */
const sizeStyles = {
  sm: css`
    max-width: 400px;
  `,
  md: css`
    max-width: 500px;
  `,
  lg: css`
    max-width: 700px;
  `,
  xl: css`
    max-width: 900px;
  `,
};

/**
 * Overlay do modal (fundo escurecido)
 */
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
`;

/**
 * Container do modal
 */
export const ModalContainer = styled.div<{ size: ModalProps['size'] }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s ease-out;

  /* Aplica estilo baseado no tamanho */
  ${({ size = 'md' }) => sizeStyles[size]}
`;

/**
 * Cabeçalho do modal
 */
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

/**
 * Título do modal
 */
export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/**
 * Botão de fechar
 */
export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

/**
 * Conteúdo do modal
 */
export const Content = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;

  /* Estiliza scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.textSecondary};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text};
  }
`;
