import React, { useMemo } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency, getMonthAbbreviation } from '../../../../utils/formatters';
import { getLastNMonths } from '../../../../utils/helpers';
import type { Transaction } from '../../../../types';

interface MonthlyChartProps {
  transactions: Transaction[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions }) => {
  const { theme } = useTheme();

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

  if (!hasData) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        color: theme.colors.textSecondary,
      }}>
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="name" stroke={colors.axis} fontSize={12} />
          <YAxis stroke={colors.axis} fontSize={12} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={tooltipStyle}
          />
          <Legend />
          <Bar dataKey="entradas" name="Entradas" fill={colors.success} radius={[4, 4, 0, 0]} />
          <Bar dataKey="saidas" name="Saídas" fill={colors.error} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
