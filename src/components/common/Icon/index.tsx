/**
 * @file components/common/Icon/index.tsx
 * @description Componente de ícone reutilizável.
 * Usa a cor primária do tema para todos os ícones.
 */

import React from 'react';
import styled from 'styled-components';

/** Props do componente Icon */
interface IconProps {
  /** Conteúdo SVG do ícone */
  children: React.ReactNode;
  /** Tamanho do ícone em pixels (padrão: 20) */
  size?: number;
  /** Cor personalizada (usa primary do tema se não especificado) */
  color?: string;
}

/** Container do ícone com cor primária do tema */
const IconContainer = styled.svg<{ $size: number; $color?: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  viewBox: 0 0 24 24;
  fill: none;
  stroke: ${({ $color, theme }) => $color || theme.colors.primary};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

/**
 * Componente Icon
 * Wrapper reutilizável para ícones SVG Feather-style
 * Usa automaticamente a cor primária do tema
 *
 * @param {IconProps} props - Props do componente
 * @returns {JSX.Element} Ícone renderizado
 *
 * @example
 * <Icon size={24}>
 *   <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
 * </Icon>
 */
const Icon: React.FC<IconProps> = ({ children, size = 20, color }) => {
  return (
    <IconContainer $size={size} $color={color}>
      {children}
    </IconContainer>
  );
};

export default Icon;
