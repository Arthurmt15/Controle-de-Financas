/**
 * @file pages/Installments/styles.ts
 * @description Estilos redesenhados da página de parcelados.
 * Foco em visualização clara de todos os parcelados.
 */

import styled from 'styled-components';

/** Container principal */
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

/** Cabeçalho */
export const Header = styled.div`
  margin-bottom: 20px;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TitleGroup = styled.div`
  flex: 1;
`;

/** Título */
export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin: 0 0 6px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

/** Subtítulo - proposta: mostrar os parcelados */
export const Subtitle = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0;
  line-height: 1.5;
`;

export const HeaderHint = styled.p`
  margin: 12px 0 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  background: ${({ theme }) => theme.colors?.backgroundAlt || '#f3f4f6'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.5;
`;

/* Summary Grid */
export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0 20px 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.div<{ $variant?: string }>`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  background: ${({ $variant, theme }) =>
    $variant === 'primary'
      ? theme.colors?.primaryLight || '#eef2ff'
      : $variant === 'warning'
        ? '#fffbeb'
        : $variant === 'success'
          ? '#f0fdf4'
          : theme.colors?.background || '#ffffff'};
`;

export const SummaryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  flex-shrink: 0;
`;

export const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const SummaryLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

export const SummaryValue = styled.strong`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const SummarySub = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

/* Filters Bar */
export const FiltersBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 10px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors?.background || '#ffffff'};
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};

  &::placeholder {
    color: ${({ theme }) => theme.colors?.textSecondary || '#9ca3af'};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors?.primary || '#6366f1'}20`};
  }
`;

export const FilterSelect = styled.select`
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 10px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors?.background || '#ffffff'};
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  cursor: pointer;
  min-width: 160px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  }
`;

export const ResultsCount = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  white-space: nowrap;
`;

/** Ações */
export const Actions = styled.div`
  margin-bottom: 24px;
`;

/** Botão de adicionar */
export const AddButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  color: white;
  transition: opacity 0.2s, transform 0.1s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    opacity: 0.9;
  }
  &:active {
    transform: scale(0.98);
  }
`;

/** Seção do formulário */
export const FormSection = styled.div`
  margin-bottom: 24px;
`;

/** Seção da lista */
export const ListSection = styled.div``;
