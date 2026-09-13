/**
 * @file src/pages/OpenFinance/styles.ts
 * @description Estilos da página do Open Finance Brasil.
 * Usa styled-components para estilização responsiva.
 */

import styled from 'styled-components';

/** Container principal da página */
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

/** Título principal da página */
export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin-bottom: 32px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 24px;
  }
`;

/** Seção de conteúdo */
export const Section = styled.section`
  margin-bottom: 32px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#374151'};
    margin-bottom: 16px;
  }
`;

/** Estado vazio (sem dados) */
export const EmptyState = styled.div`
  background-color: ${({ theme }) => theme.colors?.backgroundAlt || '#f9fafb'};
  border: 2px dashed ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;

  p {
    color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
    margin: 8px 0;
  }

  p:first-child {
    font-size: 18px;
    font-weight: 500;
  }
`;

/** Mensagem de erro */
export const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #dc2626;
  font-size: 14px;
`;
