/**
 * @file pages/Transactions/styles.ts
 * @description Estilos da página de Transações.
 */

import styled from 'styled-components';

/**
 * Container da página
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/**
 * Container das abas
 */
export const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Aba individual
 */
export const Tab = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? 'white' : theme.colors.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary : `${theme.colors.primary}10`};
  }
`;

/**
 * Seção do formulário
 */
export const FormSection = styled.section`
  width: 100%;
`;

/**
 * Layout do chat com colunas
 */
export const ChatLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Coluna do chat
 */
export const ChatColumn = styled.div`
  min-width: 0;
`;

/**
 * Coluna do upload
 */
export const UploadColumn = styled.div`
  min-width: 0;
`;

/**
 * Seção da lista
 */
export const ListSection = styled.section`
  width: 100%;
`;
