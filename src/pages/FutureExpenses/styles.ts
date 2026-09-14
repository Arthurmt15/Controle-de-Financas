/**
 * @file pages/FutureExpenses/styles.ts
 * @description Estilos da página de despesas futuras.
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
  margin-bottom: 24px;
`;

/** Título */
export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

/** Subtítulo */
export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0;
`;

/** Ações */
export const Actions = styled.div`
  margin-bottom: 24px;
`;

/** Botão de adicionar */
export const AddButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  color: white;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

/** Seção do formulário */
export const FormSection = styled.div`
  margin-bottom: 24px;
`;

/** Seção da lista */
export const ListSection = styled.div``;
