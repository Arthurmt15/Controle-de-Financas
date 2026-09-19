/**
 * @file components/features/Dashboard/Charts.tsx
 * @description Gráficos do Dashboard redesenhados com shadcn Card + tailwind.
 * Mantém toda a lógica (recharts, períodos, categorias); remove styled-components.
 * Layout bento: dois Cards lado a lado (grid), headers com Select shadcn.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

/** Tooltip premium para Evolução Mensal — glass + saldo */
const EvolutionTooltip = (
  { active, payload, label }: any,
  formatCurrency: (n: number) => string
) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-xl p-3 min-w-[190px]">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Entradas
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(row.entradas)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Saídas
          </span>
          <span className="text-xs font-bold text-red-600 dark:text-red-400">
            {formatCurrency(row.saidas)}
          </span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-violet-500" /> Saldo
          </span>
          <span
            className={`text-xs font-bold ${row.saldo >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600'}`}
          >
            {formatCurrency(row.saldo)}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Legenda customizada da pizza — tailwind puro */
const PieLegend: React.FC<{ data: Array<{ name: string; value: number; color: string }> }> = ({
  data,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="flex flex-col gap-1.5 px-4 py-2">
      {data.map((item, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2.5 py-1 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: item.color || PIE_COLORS[index % PIE_COLORS.length] }}
          />
          <span className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-[13px] truncate text-foreground">{item.name}</span>
            <span className="text-[13px] font-semibold ml-auto whitespace-nowrap">
              {formatCurrency(item.value)}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
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

  /** Dados mensais por período — agora com saldo */
  const monthlyData = useMemo(() => {
    const monthsToUse =
      monthlyPeriod === '12' ? getCurrentYearMonths() : getLastNMonths(Number(monthlyPeriod));
    return monthsToUse.map(({ month, year }) => {
      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const entradas = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const saidas = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        name: getMonthAbbreviation(month),
        entradas,
        saidas,
        saldo: entradas - saidas,
      };
    });
  }, [transactions, monthlyPeriod]);

  const monthlyStats = useMemo(() => {
    const saldoMax = Math.max(...monthlyData.map((m) => m.saldo), 0);
    const best = monthlyData.reduce(
      (a, b) => (b.saldo > a.saldo ? b : a),
      monthlyData[0] || { name: '-', saldo: 0 }
    );
    const saldoMedio = monthlyData.length
      ? monthlyData.reduce((s, m) => s + m.saldo, 0) / monthlyData.length
      : 0;
    return { saldoMax, best, saldoMedio };
  }, [monthlyData]);

  /** Dados de categorias do mês atual */
  const categoryData = useMemo(() => {
    const now = new Date();
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
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
        return {
          name: cat?.name || 'Outros',
          value,
          color: cat?.color || theme.colors.textSecondary,
        };
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
        <CardContent className="p-0">
          {hasBarData ? (
            <>
              {/* Micro-stats acima do gráfico */}
              <div className="grid grid-cols-3 divide-x border-b bg-muted/20">
                <div className="px-3 py-2.5 text-center">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Saldo médio
                  </p>
                  <p
                    className={`text-xs font-bold mt-0.5 ${monthlyStats.saldoMedio >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600'}`}
                  >
                    {formatCurrency(monthlyStats.saldoMedio)}
                  </p>
                </div>
                <div className="px-3 py-2.5 text-center">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Melhor mês
                  </p>
                  <p className="text-xs font-bold mt-0.5">
                    {monthlyStats.best.name} • {formatCurrency(monthlyStats.best.saldo)}
                  </p>
                </div>
                <div className="px-3 py-2.5 text-center">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Período
                  </p>
                  <p className="text-xs font-bold mt-0.5">
                    {monthlyPeriod === '12' ? 'Jan–Dez' : '6 meses'}
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-3">
                <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                  <ComposedChart
                    data={monthlyData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                    barGap={6}
                    barCategoryGap="22%"
                  >
                    <defs>
                      <linearGradient id="dashBarEntradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.colors.success} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={theme.colors.success} stopOpacity={0.65} />
                      </linearGradient>
                      <linearGradient id="dashBarSaidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.colors.error} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={theme.colors.error} stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke={gridColor}
                      strokeDasharray="3 6"
                      opacity={0.5}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={axisColor}
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      dy={6}
                    />
                    <YAxis
                      stroke={axisColor}
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      dx={-2}
                      width={48}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                    />
                    <Tooltip
                      content={(props: any) => EvolutionTooltip(props, formatCurrency) as any}
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                    />
                    {/* Saldo em área sutil atrás */}
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      fill="#8b5cf6"
                      fillOpacity={0.08}
                      stroke="none"
                    />
                    <Bar
                      dataKey="entradas"
                      name="Entradas"
                      fill="url(#dashBarEntradas)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={22}
                    />
                    <Bar
                      dataKey="saidas"
                      name="Saídas"
                      fill="url(#dashBarSaidas)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={22}
                    />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      name="Saldo"
                      stroke="#8b5cf6"
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: '#8b5cf6', stroke: 'white', strokeWidth: 1.8 }}
                      activeDot={{ r: 5, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda + dica */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs border-t bg-muted/10">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: theme.colors.success }}
                    />{' '}
                    Entradas (barra)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: theme.colors.error }}
                    />{' '}
                    Saídas (barra)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-violet-500" /> Saldo (linha)
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Passe o mouse para detalhes • linha violeta = saldo do mês
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6">
              <span className="w-14 h-14 flex items-center justify-center rounded-2xl border bg-primary/10 text-primary">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold">Nenhum dado disponível</p>
              <p className="text-xs text-muted-foreground">
                Adicione transações para ver o gráfico
              </p>
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
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 70 : 80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={tooltipStyle}
                  />
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
              <p className="text-xs text-muted-foreground">
                Registre despesas para ver a distribuição por categoria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
