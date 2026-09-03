/**
 * @file components/features/Dashboard/index.tsx
 * @description Dashboard principal com métricas e gráficos financeiros.
 * Utiliza Recharts para visualização de dados (barras e pizza).
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, getMonthAbbreviation } from '../../../utils/formatters';
import { getLastNMonths } from '../../../utils/helpers';
import * as C from './styles';

/** Cores para o gráfico de pizza */
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

/**
 * Componente Dashboard
 * Exibe cards de métricas e gráficos de evolução mensal e categorias
 */
const Dashboard: React.FC = () => {
  const { transactions, metrics, categories } = useTransactions();

  /**
   * Prepara dados para gráfico de barras (últimos 6 meses)
   * Retorna array com entradas e saídas por mês
   */
  const getMonthlyData = () => {
    return getLastNMonths(6).map(({ month, year, name }) => {
      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      return {
        name: getMonthAbbreviation(month),
        entradas: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        saidas: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  };

  /**
   * Prepara dados para gráfico de pizza (despesas por categoria)
   * Retorna array com nome, valor e cor de cada categoria
   */
  const getCategoryData = () => {
    const now = new Date();
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totals = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(totals)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || 'Outros', value, color: cat?.color || '#6b7280' };
      })
      .sort((a, b) => b.value - a.value);
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  return (
    <C.Container>
      <C.Title>Dashboard</C.Title>

      {/* Cards de métricas */}
      <C.MetricsGrid>
        <C.MetricCard>
          <C.MetricIcon $type="income">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.93-3.12 3.19z" />
            </svg>
          </C.MetricIcon>
          <C.MetricContent>
            <C.MetricLabel>Entradas do Mês</C.MetricLabel>
            <C.MetricValue $type="income">{formatCurrency(metrics.monthlyIncome)}</C.MetricValue>
          </C.MetricContent>
        </C.MetricCard>

        <C.MetricCard>
          <C.MetricIcon $type="expense">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.93-3.12 3.19z" />
            </svg>
          </C.MetricIcon>
          <C.MetricContent>
            <C.MetricLabel>Saídas do Mês</C.MetricLabel>
            <C.MetricValue $type="expense">{formatCurrency(metrics.monthlyExpense)}</C.MetricValue>
          </C.MetricContent>
        </C.MetricCard>

        <C.MetricCard>
          <C.MetricIcon $type={metrics.monthlyBalance >= 0 ? 'income' : 'expense'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          </C.MetricIcon>
          <C.MetricContent>
            <C.MetricLabel>Saldo do Mês</C.MetricLabel>
            <C.MetricValue $type={metrics.monthlyBalance >= 0 ? 'income' : 'expense'}>
              {formatCurrency(metrics.monthlyBalance)}
            </C.MetricValue>
          </C.MetricContent>
        </C.MetricCard>

        <C.MetricCard>
          <C.MetricIcon $type={metrics.yearlyBalance >= 0 ? 'income' : 'expense'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </C.MetricIcon>
          <C.MetricContent>
            <C.MetricLabel>Saldo Anual</C.MetricLabel>
            <C.MetricValue $type={metrics.yearlyBalance >= 0 ? 'income' : 'expense'}>
              {formatCurrency(metrics.yearlyBalance)}
            </C.MetricValue>
          </C.MetricContent>
        </C.MetricCard>
      </C.MetricsGrid>

      {/* Gráficos */}
      <C.ChartsGrid>
        <C.ChartCard>
          <C.ChartTitle>Evolução Mensal</C.ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </C.ChartCard>

        <C.ChartCard>
          <C.ChartTitle>Despesas por Categoria</C.ChartTitle>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <C.EmptyChart>Nenhuma despesa este mês</C.EmptyChart>
          )}
        </C.ChartCard>
      </C.ChartsGrid>
    </C.Container>
  );
};

export default Dashboard;
