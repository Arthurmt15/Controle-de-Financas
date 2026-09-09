/**
 * @file components/features/Dashboard/Charts.tsx
 * @description Componente de gráficos do Dashboard.
 * Exibe gráfico de barras (evolução mensal) e pizza (categorias).
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, getMonthAbbreviation } from '../../../utils/formatters';
import { getLastNMonths, getCurrentYearMonths } from '../../../utils/helpers';
import * as C from './styles';

/** Cores para o gráfico de pizza (paleta indigo) */
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

/** Legenda customizada para o gráfico de pizza */
const PieLegend: React.FC<{ data: Array<{ name: string; value: number; color: string }> }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <C.PieLegendContainer>
      {data.map((item, index) => (
        <C.PieLegendItem key={`legend-${index}`}>
          <C.PieLegendDot $color={item.color || PIE_COLORS[index % PIE_COLORS.length]} />
          <C.PieLegendText>
            <C.PieLegendName>{item.name}</C.PieLegendName>
            <C.PieLegendValue>{formatCurrency(item.value)}</C.PieLegendValue>
            <C.PieLegendPercent>{((item.value / total) * 100).toFixed(1)}%</C.PieLegendPercent>
          </C.PieLegendText>
        </C.PieLegendItem>
      ))}
    </C.PieLegendContainer>
  );
};

/**
 * Componente Charts
 * Exibe gráficos de evolução mensal e despesas por categoria
 */
const Charts: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const { theme } = useTheme();
  const [monthlyPeriod, setMonthlyPeriod] = useState<'12' | '6'>('12');

  /** Estilo do tooltip adaptado ao tema */
  const tooltipStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    color: theme.colors.text,
  }), [theme]);

  /** Cor da grid e eixos adaptada ao tema */
  const gridColor = theme.colors.border;
  const axisColor = theme.colors.textSecondary;

  const monthlyData = useMemo(() => {
    const monthsToUse = monthlyPeriod === '12' 
      ? getCurrentYearMonths() 
      : getLastNMonths(Number(monthlyPeriod));
    
    return monthsToUse.map(({ month, year }) => {
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
  }, [transactions, monthlyPeriod]);

  const categoryData = useMemo(() => {
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
        return { name: cat?.name || 'Outros', value, color: cat?.color || theme.colors.textSecondary };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, theme]);

  const hasBarData = monthlyData.some((d) => d.entradas > 0 || d.saidas > 0);

  return (
    <C.ChartsGrid>
      <C.Panel $height="387px">
        <C.PanelHeader>
          <h2>Evolução Mensal</h2>
          <C.PanelSelect
            value={monthlyPeriod}
            onChange={(e) => setMonthlyPeriod(e.target.value as '12' | '6')}
          >
            <option value="12">Este Ano</option>
            <option value="6">Últimos 6 meses</option>
          </C.PanelSelect>
        </C.PanelHeader>
        {hasBarData ? (
          <ResponsiveContainer width="100%" height={285}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={10} />
              <YAxis stroke={axisColor} fontSize={10} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="entradas" fill={theme.colors.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" fill={theme.colors.error} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <C.EmptyChartMessage>
            <C.EmptyIcon>📊</C.EmptyIcon>
            <strong>Nenhum dado disponível</strong>
            <span>Adicione transações para ver o gráfico</span>
          </C.EmptyChartMessage>
        )}
        <C.Legend>
          <span><C.Dot $color={theme.colors.success} /> Entradas</span>
          <span><C.Dot $color={theme.colors.error} /> Saídas</span>
        </C.Legend>
      </C.Panel>

      <C.Panel $height="387px">
        <C.PanelHeader>
          <h2>Despesas por Categoria</h2>
          <C.PanelSelect>
            <option>Este Mês</option>
            <option>Último Trimestre</option>
          </C.PanelSelect>
        </C.PanelHeader>
        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={categoryData} />
          </>
        ) : (
          <C.CategoryEmpty>
            <C.CategoryIcon>📁</C.CategoryIcon>
            <strong>Nenhuma despesa este mês</strong>
            <span>Registre despesas para ver a distribuição por categoria</span>
          </C.CategoryEmpty>
        )}
      </C.Panel>
    </C.ChartsGrid>
  );
};

export default Charts;