/**
 * @file components/features/Dashboard/Charts.tsx
 * @description Componente de gráficos do Dashboard.
 * Exibe gráfico de barras (evolução mensal) e pizza (categorias).
 */

import React, { useState, useMemo } from 'react';
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

/** Estilo comum do tooltip */
const TOOLTIP_STYLE = {
  backgroundColor: '#111a2a',
  border: '1px solid #202b3f',
  borderRadius: '8px',
  color: '#f7f8fb',
};

/**
 * Componente Charts
 * Exibe gráficos de evolução mensal e despesas por categoria
 */
const Charts: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const [monthlyPeriod, setMonthlyPeriod] = useState<'12' | '6'>('12');

  /**
   * Prepara dados para gráfico de barras (evolução mensal do ano selecionado)
   * Retorna array com entradas e saídas por mês
   */
  const monthlyData = useMemo(() => {
    return getLastNMonths(Number(monthlyPeriod)).map(({ month, name }) => {
      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === new Date().getFullYear();
      });
      return {
        name: getMonthAbbreviation(month),
        entradas: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        saidas: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, monthlyPeriod]);

  /**
   * Prepara dados para gráfico de pizza (despesas por categoria)
   * Retorna array com nome, valor e cor de cada categoria
   */
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
        return { name: cat?.name || 'Outros', value, color: cat?.color || '#6b7280' };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  /** Verifica se há dados para exibir no gráfico de barras */
  const hasBarData = monthlyData.some((d) => d.entradas > 0 || d.saidas > 0);

  return (
    <C.ChartsGrid>
      {/* Gráfico de evolução mensal */}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#202b3f" />
              <XAxis dataKey="name" stroke="#8d99ad" fontSize={10} />
              <YAxis stroke="#8d99ad" fontSize={10} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="entradas" fill="#00c98b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" fill="#ff4d55" radius={[4, 4, 0, 0]} />
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
          <span><C.Dot $color="#00c98b" /> Entradas</span>
          <span><C.Dot $color="#ff4d55" /> Saídas</span>
        </C.Legend>
      </C.Panel>

      {/* Gráfico de categorias */}
      <C.Panel $height="387px">
        <C.PanelHeader>
          <h2>Despesas por Categoria</h2>
          <C.PanelSelect>
            <option>Este Mês</option>
            <option>Último Trimestre</option>
          </C.PanelSelect>
        </C.PanelHeader>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={285}>
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
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
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
