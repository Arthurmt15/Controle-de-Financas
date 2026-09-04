/**
 * @file components/common/Icon/index.tsx
 * @description Componente de ícone reutilizável.
 * Usa a cor primária do tema para todos os ícones.
 */

import React from 'react';

/** Props do componente Icon */
interface IconProps {
  /** Conteúdo SVG do ícone */
  children: React.ReactNode;
  /** Tamanho do ícone em pixels (padrão: 20) */
  size?: number;
  /** Cor personalizada (usa primary do tema se não especificado) */
  color?: string;
}

/**
 * Componente Icon
 * Wrapper reutilizável para ícones SVG Feather-style
 * Usa automaticamente a cor primária do tema
 *
 * @param {IconProps} props - Props do componente
 * @returns {JSX.Element} Ícone renderizado
 */
const Icon: React.FC<IconProps> = ({ children, size = 20, color }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
};

export default Icon;
