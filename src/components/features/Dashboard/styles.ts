/**
 * @file components/features/Dashboard/styles.ts
 * @description Estilos do componente Dashboard.
 */

import styled from 'styled-components';

/**
 * Container principal
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/**
 * Título
 */
export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

/**
 * Grid de métricas
 */
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Card de métrica
 */
export const MetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Ícone da métrica
 */
export const MetricIcon = styled.div<{ $type: 'income' | 'expense' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $type }) =>
    $type === 'income' ? `${theme.colors.success}15` : `${theme.colors.error}15`};
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
`;

/**
 * Conteúdo da métrica
 */
export const MetricContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/**
 * Label da métrica
 */
export const MetricLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Valor da métrica
 */
export const MetricValue = styled.span<{ $type: 'income' | 'expense' }>`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
`;

/**
 * Grid de gráficos
 */
export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Card de gráfico
 */
export const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * Título do gráfico
 */
export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

/**
 * Gráfico vazio
 */
export const EmptyChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
