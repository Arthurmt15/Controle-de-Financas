/**
 * @file components/features/BudgetManager/styles.ts
 * @description Estilos do componente BudgetManager.
 */

import styled from 'styled-components';

/** Container principal */
export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/** Cabeçalho com título e seletor */
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

/** Título do componente */
export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/** Container do seletor de mês */
export const MonthSelector = styled.div``;

/** Input de seleção de mês */
export const MonthInput = styled.input`
  padding: 8px 14px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
