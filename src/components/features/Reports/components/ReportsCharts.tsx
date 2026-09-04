/**
 * @file components/features/Reports/components/ReportsCharts.tsx
 * @description Componente de gráficos para a página de relatórios.
 * Exibe gráficos de barras, linha e pizza para análise financeira.
 */

import React, { useMemo } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency } from '../../../../utils/formatters';
import * as C from './ReportsCharts.styles';

/** Cores para gráficos de pizza */
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#6366f1'];

interface ReportsChartsProps {
  monthlyData: Array<{ name: string; entradas: number; saidas: number }>;
  dailyTrend: Array<{ name: string; entradas: number; saidas: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  incomeCategoryData: Array<{ name: string; value: number; color: string }>;
}

/**
 * Componente de gráficos de relatório
 */
const ReportsCharts: React.FC<ReportsChartsProps> = ({
  monthlyData,
  dailyTrend,
  categoryData,
  incomeCategoryData,
}) => {
  const { theme } = useTheme();

  /** Cores derivadas do tema */
  const colors = useMemo(() => ({
    grid: theme.colors.border,
    axis: theme.colors.textSecondary,
    success: theme.colors.success,
    error: theme.colors.error,
    tooltipBg: theme.colors.surface,
    tooltipBorder: theme.colors.border,
    tooltipText: theme.colors.text,
  }), [theme]);

  const tooltipStyle = useMemo(() => ({
    backgroundColor: colors.tooltipBg,
    border: `1px solid ${colors.tooltipBorder}`,
    borderRadius: '8px',
    color: colors.tooltipText,
  }), [colors]);

  const renderPieChart = (
    data: Array<{ name: string; value: number; color: string }>,
    emptyMessage: string
  ) => {
    if (data.length === 0) {
      return <C.EmptyChart>{emptyMessage}</C.EmptyChart>;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
            }
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <C.ChartsGrid>
      <C.ChartCard>
        <C.ChartTitle>Evolução Mensal (12 meses)</C.ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="name" stroke={colors.axis} fontSize={12} />
            <YAxis stroke={colors.axis} fontSize={12} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="entradas" fill={colors.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="saidas" fill={colors.error} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </C.ChartCard>

      <C.ChartCard>
        <C.ChartTitle>Tendência Diária</C.ChartTitle>
        {dailyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" stroke={colors.axis} fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke={colors.axis} fontSize={12} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="entradas" stroke={colors.success} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="saidas" stroke={colors.error} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <C.EmptyChart>Nenhum dado disponível</C.EmptyChart>
        )}
      </C.ChartCard>

      <C.ChartCard>
        <C.ChartTitle>Despesas por Categoria</C.ChartTitle>
        {renderPieChart(categoryData, 'Nenhuma despesa no período')}
      </C.ChartCard>

      <C.ChartCard>
        <C.ChartTitle>Receitas por Categoria</C.ChartTitle>
        {renderPieChart(incomeCategoryData, 'Nenhuma receita no período')}
      </C.ChartCard>
    </C.ChartsGrid>
  );
};

export default ReportsCharts;