/**
 * @file components/features/Analysis/components/MonthlyChart.tsx
 * @description Gráfico de barras (12 meses) com Recharts envolto em shadcn Card interno.
 * Usa tailwind + lucide para empty state. Cores: emerald para entradas, red para saídas.
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatCurrency, getMonthAbbreviation } from '../../../../utils/formatters';
import { getLastNMonths } from '../../../../utils/helpers';
import { Card, CardContent } from '../../../ui/card';
import type { Transaction } from '../../../../types';

interface MonthlyChartProps {
  transactions: Transaction[];
}

// Gráfico de evolução mensal (últimos 12 meses)
const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions }) => {
  // Paleta fixa (evita dependência de styled-components theme)
  const colors = useMemo(
    () => ({
      grid: 'hsl(var(--border))',
      axis: 'hsl(var(--muted-foreground))',
      success: '#10b981',
      error: '#ef4444',
      tooltipBg: 'hsl(var(--card))',
      tooltipBorder: 'hsl(var(--border))',
      tooltipText: 'hsl(var(--foreground))',
    }),
    []
  );

  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: colors.tooltipBg,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: '12px',
      color: colors.tooltipText,
      fontSize: '12px',
    }),
    [colors]
  );

  // Agrega transações por mês (12 últimos meses)
  const monthlyData = useMemo(() => {
    return getLastNMonths(12).map(({ month, year }) => {
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
  }, [transactions]);

  const hasData = monthlyData.some((m) => m.entradas > 0 || m.saidas > 0);

  // Estado vazio
  if (!hasData) {
    return (
      <Card className="rounded-xl border-dashed bg-muted/20">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground text-center">
          <span className="p-2.5 rounded-xl bg-muted">
            <BarChart3 className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">Nenhum dado disponível</p>
          <p className="text-xs">Adicione transações para ver a evolução mensal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis dataKey="name" stroke={colors.axis} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={colors.axis} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar dataKey="entradas" name="Entradas" fill={colors.success} radius={[6, 6, 0, 0]} />
          <Bar dataKey="saidas" name="Saídas" fill={colors.error} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
