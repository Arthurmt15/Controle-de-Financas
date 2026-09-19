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
  gap: 14px;
  align-items: center;
  padding: 18px 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  background: ${({ theme }) => theme.colors?.background || '#ffffff'};
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.03);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
  }
`;

export const SummaryIcon = styled.div<{ $variant?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
  background: ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `linear-gradient(135deg, ${theme.colors?.primary || '#6366f1'} 0%, #8b5cf6 100%)`
      : $variant === 'warning'
        ? `linear-gradient(135deg, #f59e0b 0%, #f97316 100%)`
        : $variant === 'success'
          ? `linear-gradient(135deg, #10b981 0%, #06b6d4 100%)`
          : `linear-gradient(135deg, #64748b 0%, #475569 100%)`};
  box-shadow: 0 4px 10px
    ${({ $variant }) =>
      $variant === 'primary'
        ? 'rgba(99, 102, 241, 0.3)'
        : $variant === 'warning'
          ? 'rgba(245, 158, 11, 0.3)'
          : $variant === 'success'
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(100, 116, 139, 0.2)'};
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
  transition:
    opacity 0.2s,
    transform 0.1s;
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
