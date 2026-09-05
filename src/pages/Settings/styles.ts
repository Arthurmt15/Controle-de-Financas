/**
 * @file pages/Settings/styles.ts
 * @description Estilos da página de Configurações.
 * Contém estilos para container, título, abas de navegação e conteúdo.
 */

import styled from 'styled-components';

/**
 * Container principal da página de configurações
 * Layout flexível vertical com espaçamento entre seções
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/**
 * Título principal da página
 * Tipografia grande e negrito para destaque
 */
export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/**
 * Container das abas de navegação
 * Layout horizontal com scroll em telas pequenas
 * Suporte a mobile com scroll horizontal suave
 */
export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  /* Esconde scrollbar para manter design limpo */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Ajustes para telas muito pequenas */
  @media (max-width: 480px) {
    gap: 2px;
    padding: 3px;
  }
`;

/**
 * Botão de aba individual
 * Alterna visualmente entre estado ativo e inativo
 * Suporte a mobile com tamanho reduzido
 * @param {boolean} $isActive - Estado ativo da aba
 */
export const Tab = styled.button<{ $isActive: boolean }>`
  flex: 1;
  min-width: fit-content;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $isActive }) => ($isActive ? 'white' : theme.colors.text)};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primaryHover : theme.colors.surfaceHover};
  }

  /* Ajustes para telas pequenas */
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

/**
 * Container do conteúdo da aba selecionada
 * Ocupa toda a largura disponível
 */
export const Content = styled.div`
  width: 100%;
`;
