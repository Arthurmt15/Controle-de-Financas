/**
 * @file components/common/SkipLink/index.tsx
 * @description Componente SkipLink para acessibilidade.
 * Permite que usuários de leitor de tela pulem para o conteúdo principal.
 */

import React from 'react';
import styled from 'styled-components';

/**
 * Container do SkipLink (oculto até foco)
 */
const Container = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 8px 16px;
  z-index: 10000;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius} 0;

  &:focus {
    top: 0;
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

/**
 * Props do SkipLink
 */
interface SkipLinkProps {
  /** ID do elemento de destino */
  targetId?: string;
  /** Texto do link */
  text?: string;
}

/**
 * Componente SkipLink para acessibilidade
 * Visível apenas quando focado (Tab no início da página)
 * @param {SkipLinkProps} props - Props do componente
 *
 * @example
 * <SkipLink targetId="main-content" text="Pular para o conteúdo" />
 */
const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  text = 'Pular para o conteúdo principal',
}) => {
  /**
   * Manipula o clique e foca no elemento alvo
   */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
    }
  };

  return (
    <Container href={`#${targetId}`} onClick={handleClick}>
      {text}
    </Container>
  );
};

export default SkipLink;
