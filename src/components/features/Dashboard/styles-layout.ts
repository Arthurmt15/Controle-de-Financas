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
  display: flex; justify-content: space-between; align-items: flex-end; gap: 16px;
  margin-bottom: 20px; flex-wrap: wrap;
  h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; color: ${({ theme }) => theme.colors.text};
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.text} 40%, ${({ theme }) => theme.colors.textSecondary});
    -webkit-background-clip: text; background-clip: text;
  }
  p { margin-top: 6px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 13.5px; max-width: 520px; }
  @media (max-width: 600px) { h1 { font-size: 24px; } }
`;
export const HeadingMeta = styled.div`
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 500; color: ${({ theme }) => theme.colors.textSecondary};
  padding: 8px 12px; border-radius: 999px; border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface}; white-space: nowrap;
`;
