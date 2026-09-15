/**
 * @file components/features/TransactionList/styles.ts
 * @description Estilos do componente TransactionList.
 */

import styled from 'styled-components';

/**
 * Container principal
 */
export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

/**
 * Cabeçalho
 */
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

/**
 * Título
 */
export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/**
 * Botões de exportação
 */
export const ExportButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

/**
 * Botão de exportação
 */
export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;

/**
 * Filtros
 */
export const Filters = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

/**
 * Input de busca
 */
export const SearchInput = styled.input`
  padding: 10px 16px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  min-width: 200px;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

/**
 * Select de filtro
 */
export const FilterSelect = styled.select`
  padding: 10px 32px 10px 16px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

/**
 * Wrapper da tabela
 */
export const TableWrapper = styled.div`
  overflow-x: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Tabela
 */
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

/**
 * Thead
 */
export const Thead = styled.thead`
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

/**
 * Tbody
 */
export const Tbody = styled.tbody``;

/**
 * Tr
 */
export const Tr = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;
