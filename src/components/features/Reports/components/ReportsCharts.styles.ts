/**
 * @file components/features/Reports/components/ReportsCharts.styles.ts
 * @description Estilos dos gráficos de relatório.
 */

import styled from 'styled-components';

/** Grid responsivo de gráficos */
export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/** Card de gráfico */
export const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/** Título do gráfico */
export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

/** Mensagem de gráfico vazio */
export const EmptyChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
