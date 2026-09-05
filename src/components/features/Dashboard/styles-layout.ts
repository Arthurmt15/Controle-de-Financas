/**
 * @file components/features/Dashboard/styles-layout.ts
 * @description Estilos de layout do Dashboard.
 * Contém estilos para container principal e cabeçalho da página.
 */

import styled from 'styled-components';

/**
 * Container principal do dashboard
 * Ocupa 100% da largura disponível
 * Serve como wrapper para todos os componentes do dashboard
 */
export const Container = styled.div`
  width: 100%;
`;

/**
 * Cabeçalho da página do dashboard
 * Contém título e descrição da página
 * Margem inferior para separar do conteúdo
 * Responsivo: reduz tamanho do título em telas pequenas
 */
export const PageHeading = styled.div`
  margin-bottom: 24px;
  h1 { font-size: 27px; letter-spacing: -0.6px; color: ${({ theme }) => theme.colors.text}; }
  p { margin-top: 6px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 13px; }
  @media (max-width: 600px) { h1 { font-size: 24px; } }
`;
