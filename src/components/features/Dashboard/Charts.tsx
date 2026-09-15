/**
 * @file components/features/Dashboard/Charts.tsx
 * @description Gráficos do Dashboard redesenhados com shadcn Card + tailwind.
 * Mantém toda a lógica (recharts, períodos, categorias); remove styled-components.
 * Layout bento: dois Cards lado a lado (grid), headers com Select shadcn.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, getMonthAbbreviation } from '../../../utils/formatters';
import { getLastNMonths, getCurrentYearMonths } from '../../../utils/helpers';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { BarChart3, PieChart as PieChartIcon, Inbox } from 'lucide-react';

/** Paleta para pizza */
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

/** Legenda customizada da pizza — tailwind puro */
const PieLegend: React.FC<{ data: Array<{ name: string; value: number; color: string }> }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="flex flex-col gap-1.5 px-4 py-2">
      {data.map((item, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2.5 py-1 text-sm">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color || PIE_COLORS[index % PIE_COLORS.length] }} />
          <span className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-[13px] truncate text-foreground">{item.name}</span>
            <span className="text-[13px] font-semibold ml-auto whitespace-nowrap">{formatCurrency(item.value)}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{((item.value / total) * 100).toFixed(1)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
};

/** Gráficos bento: evolução mensal (barras) + despesas por categoria (pizza) */
const Charts: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const { theme } = useTheme();
  const [monthlyPeriod, setMonthlyPeriod] = useState<'12' | '6'>('12');

  // Breakpoint simples para rótulos
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  /** Estilo do tooltip adaptado ao tema (inline pois recharts exige) */
  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      color: theme.colors.text,
    }),
    [theme]
  );

  const gridColor = theme.colors.border;
  const axisColor = theme.colors.textSecondary;

  /** Dados mensais por período */
  const monthlyData = useMemo(() => {
    const monthsToUse = monthlyPeriod === '12' ? getCurrentYearMonths() : getLastNMonths(Number(monthlyPeriod));
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

  /** Dados de categorias do mês atual */
  const categoryData = useMemo(() => {
    const now = new Date();
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totals = expenses.reduce(
      (acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(totals)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || 'Outros', value, color: cat?.color || theme.colors.textSecondary };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, theme]);

  const hasBarData = monthlyData.some((d) => d.entradas > 0 || d.saidas > 0);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Evolução mensal */}
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-5 border-b bg-card">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            Evolução Mensal
          </CardTitle>
          {/* Select shadcn controlado */}
          <Select value={monthlyPeriod} onValueChange={(v) => setMonthlyPeriod(v as '12' | '6')}>
            <SelectTrigger className="w-[150px] h-9 rounded-xl text-xs">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">Este Ano</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          {hasBarData ? (
            <>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 285}>
                <BarChart data={monthlyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke={axisColor}
                    fontSize={isMobile ? 11 : 10}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                  />
                  <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={isMobile ? 12 : 10} width={isMobile ? 40 : 30} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '12px' : '11px' }} />
                  <Bar dataKey="entradas" fill={theme.colors.success} radius={[0, 4, 4, 0]} barSize={isMobile ? 14 : 12} />
                  <Bar dataKey="saidas" fill={theme.colors.error} radius={[0, 4, 4, 0]} barSize={isMobile ? 14 : 12} />
                </BarChart>
              </ResponsiveContainer>
              {/* Legenda manual discreta */}
              <div className="flex justify-center gap-6 py-3 text-xs text-muted-foreground border-t">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.colors.success }} />
                  Entradas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.colors.error }} />
                  Saídas
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6">
              <span className="w-14 h-14 flex items-center justify-center rounded-2xl border bg-primary/10 text-primary">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold">Nenhum dado disponível</p>
              <p className="text-xs text-muted-foreground">Adicione transações para ver o gráfico</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Despesas por categoria */}
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4 px-5 border-b bg-card">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
              <PieChartIcon className="h-3.5 w-3.5" />
            </span>
            Despesas por Categoria
          </CardTitle>
          <Select defaultValue="month">
            <SelectTrigger className="w-[150px] h-9 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={isMobile ? 70 : 80} dataKey="value">
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
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6 min-h-[280px]">
              <span className="w-14 h-14 flex items-center justify-center rounded-2xl border bg-primary/10 text-primary">
                <PieChartIcon className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold">Nenhuma despesa este mês</p>
              <p className="text-xs text-muted-foreground">Registre despesas para ver a distribuição por categoria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
