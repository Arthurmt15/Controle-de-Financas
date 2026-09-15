/**
 * @file components/features/Analysis/components/MonthlyChart.tsx
 * @description Evolução mensal premium — Área com gradiente + Barras alternáveis, tooltip glass, saldo e micro-stats.
 * Recharts + tailwind + framer-motion, 100% theme-aware (dark/light).
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Activity, Layers, Sparkles } from 'lucide-react';
import { formatCurrency, getMonthAbbreviation } from '../../../../utils/formatters';
import { getLastNMonths } from '../../../../utils/helpers';
import { Card, CardContent } from '../../../ui/card';
import type { Transaction } from '../../../../types';

interface MonthlyChartProps {
  transactions: Transaction[];
  height?: number;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, height = 300 }) => {
  const [view, setView] = useState<'area' | 'bar'>('area');

  const monthlyData = useMemo(() => {
    return getLastNMonths(12).map(({ month, year }) => {
      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const entradas = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const saidas = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { name: getMonthAbbreviation(month), entradas, saidas, saldo: entradas - saidas, full: `${getMonthAbbreviation(month)}/${String(year).slice(-2)}` };
    });
  }, [transactions]);

  const hasData = monthlyData.some((m) => m.entradas > 0 || m.saidas > 0);
  const stats = useMemo(() => {
    const totalEntradas = monthlyData.reduce((s, m) => s + m.entradas, 0);
    const totalSaidas = monthlyData.reduce((s, m) => s + m.saidas, 0);
    const avgEntradas = totalEntradas / 12;
    const avgSaidas = totalSaidas / 12;
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    const trend = prev && prev.saldo !== 0 ? ((last.saldo - prev.saldo) / Math.abs(prev.saldo)) * 100 : 0;
    const best = monthlyData.reduce((a, b) => (b.saldo > a.saldo ? b : a), monthlyData[0]);
    return { avgEntradas, avgSaidas, trend, best };
  }, [monthlyData]);

  if (!hasData) {
    return (
      <Card className="rounded-2xl border-dashed bg-muted/20 overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground text-center">
          <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 rounded-2xl bg-muted border shadow-sm">
            <BarChart3 className="h-6 w-6" />
          </motion.span>
          <p className="text-sm font-semibold text-foreground">Sem histórico ainda</p>
          <p className="text-xs max-w-[260px] leading-relaxed">Adicione transações e veja sua evolução com tendências e saldo acumulado em um visual premium.</p>
        </CardContent>
      </Card>
    );
  }

  // Tooltip premium
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    return (
      <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-xl p-3.5 min-w-[200px]">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Activity className="h-3 w-3" /> {row.full}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Entradas</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.entradas)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-2 w-2 rounded-full bg-red-500" /> Saídas</span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(row.saidas)}</span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-violet-500" /> Saldo</span>
            <span className={`text-sm font-bold ${row.saldo >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600'}`}>{formatCurrency(row.saldo)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {/* Header do gráfico — toggle + micro-stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-full bg-muted border">
            <button
              onClick={() => setView('area')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${view === 'area' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Activity className="h-3.5 w-3.5" /> Área
            </button>
            <button
              onClick={() => setView('bar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${view === 'bar' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Layers className="h-3.5 w-3.5" /> Barras
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300">
            <Sparkles className="h-3 w-3" /> Premium
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300">
            <TrendingUp className="h-3 w-3" /> Média entr. {formatCurrency(stats.avgEntradas)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">
            <TrendingDown className="h-3 w-3" /> Média saídas {formatCurrency(stats.avgSaidas)}
          </span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border bg-card/50 backdrop-blur p-2 sm:p-3">
        <ResponsiveContainer width="100%" height={height}>
          {view === 'area' ? (
            <AreaChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" opacity={0.5} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dx={-4} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '4 4' }} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="2 6" />
              <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#8b5cf6" strokeWidth={1.8} strokeDasharray="6 4" fill="url(#gradSaldo)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2.4} fill="url(#gradEntradas)" dot={{ r: 3, fill: '#10b981', stroke: 'white', strokeWidth: 1.8 }} activeDot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" strokeWidth={2.4} fill="url(#gradSaidas)" dot={{ r: 3, fill: '#ef4444', stroke: 'white', strokeWidth: 1.8 }} activeDot={{ r: 5, fill: '#ef4444', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          ) : (
            <BarChart data={monthlyData} barGap={8} barCategoryGap="22%">
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" opacity={0.45} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dx={-4} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.35)' }} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Rodapé com insight rápido */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Tendência</span>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${stats.trend >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300'}`}>
            {stats.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {Math.abs(stats.trend).toFixed(1)}%
          </span>
        </div>
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Melhor mês</span>
          <span className="text-xs font-bold">{stats.best.full} • {formatCurrency(stats.best.saldo)}</span>
        </div>
        <div className="rounded-xl border bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 px-3 py-2.5 flex items-center gap-2 text-violet-700 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-medium leading-none">Saldo acumulado visível em tracejado</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;
