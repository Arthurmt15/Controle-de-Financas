/**
 * @file components/features/Analysis/components/MonthlyChart.tsx
 * @description Evolução mensal V2 — ComposedChart unificado: barras (entradas/saídas) + linha de saldo.
 * Alternância entre "Fluxo mensal" (saldo do mês) e "Acumulado" (saldo acumulado no ano).
 * Visual totalmente diferente do anterior (que alternava Área vs Barras separados).
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { formatCurrency, getMonthAbbreviation } from '../../../../utils/formatters';
import { getLastNMonths } from '../../../../utils/helpers';
import { Card, CardContent } from '../../../ui/card';
import type { Transaction } from '../../../../types';

interface MonthlyChartProps {
  transactions: Transaction[];
  height?: number;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, height = 300 }) => {
  const [mode, setMode] = useState<'fluxo' | 'acumulado'>('fluxo');

  const monthlyData = useMemo(() => {
    let acumulado = 0;
    return getLastNMonths(12).map(({ month, year }) => {
      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const entradas = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const saidas = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const saldo = entradas - saidas;
      acumulado += saldo;
      return {
        name: getMonthAbbreviation(month),
        full: `${getMonthAbbreviation(month)}/${String(year).slice(-2)}`,
        entradas,
        saidas,
        saldo,
        acumulado,
      };
    });
  }, [transactions]);

  const hasData = monthlyData.some((m) => m.entradas > 0 || m.saidas > 0);
  const stats = useMemo(() => {
    const totalEntradas = monthlyData.reduce((s, m) => s + m.entradas, 0);
    const totalSaidas = monthlyData.reduce((s, m) => s + m.saidas, 0);
    const saldoTotal = totalEntradas - totalSaidas;
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    const trend =
      prev && Math.abs(prev.saldo) > 0
        ? ((last.saldo - prev.saldo) / Math.abs(prev.saldo)) * 100
        : 0;
    const best = monthlyData.reduce((a, b) => (b.saldo > a.saldo ? b : a), monthlyData[0]);
    const worst = monthlyData.reduce((a, b) => (b.saldo < a.saldo ? b : a), monthlyData[0]);
    return { totalEntradas, totalSaidas, saldoTotal, trend, best, worst };
  }, [monthlyData]);

  if (!hasData) {
    return (
      <Card className="rounded-2xl border-dashed bg-muted/20 overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground text-center">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 rounded-2xl bg-muted border shadow-sm"
          >
            <BarChart3 className="h-6 w-6" />
          </motion.span>
          <p className="text-sm font-semibold text-foreground">Sem histórico ainda</p>
          <p className="text-xs max-w-[260px] leading-relaxed">
            Adicione transações e veja sua evolução com barras + saldo em um visual novo e
            unificado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    if (!row) return null;
    return (
      <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-xl p-3.5 min-w-[210px]">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2.5">
          {row.full}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Entradas
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(row.entradas)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Saídas
            </span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {formatCurrency(row.saidas)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-violet-500" />{' '}
              {mode === 'acumulado' ? 'Acumulado' : 'Saldo'}
            </span>
            <span
              className={`text-sm font-bold ${(mode === 'acumulado' ? row.acumulado : row.saldo) >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600'}`}
            >
              {formatCurrency(mode === 'acumulado' ? row.acumulado : row.saldo)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {/* Header — novo: segmentado Fluxo vs Acumulado + badges de total */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-full bg-muted border">
            <button
              onClick={() => setMode('fluxo')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'fluxo' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Layers className="h-3.5 w-3.5" /> Fluxo mensal
            </button>
            <button
              onClick={() => setMode('acumulado')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'acumulado' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Wallet className="h-3.5 w-3.5" /> Acumulado
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300">
            <Sparkles className="h-3 w-3" /> Barras + Linha
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border bg-emerald-50/70 dark:bg-emerald-500/10 px-3 py-2 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-700/70 dark:text-emerald-300/80">
              Entradas 12m
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate">
              {formatCurrency(stats.totalEntradas)}
            </span>
          </div>
          <div className="rounded-xl border bg-red-50/70 dark:bg-red-500/10 px-3 py-2 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-red-700/70 dark:text-red-300/80">
              Saídas 12m
            </span>
            <span className="text-xs font-bold text-red-700 dark:text-red-300 truncate">
              {formatCurrency(stats.totalSaidas)}
            </span>
          </div>
          <div className="rounded-xl border bg-violet-50 dark:bg-violet-500/10 px-3 py-2 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-violet-700/70 dark:text-violet-300/80">
              Saldo total
            </span>
            <span
              className={`text-xs font-bold truncate ${stats.saldoTotal >= 0 ? 'text-violet-700 dark:text-violet-300' : 'text-red-700'}`}
            >
              {formatCurrency(stats.saldoTotal)}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border bg-card/50 backdrop-blur p-2 sm:p-3"
      >
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={monthlyData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            barGap={6}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="anaEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="anaSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="anaAcum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 6"
              opacity={0.45}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              dx={-4}
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="2 6" />
            {mode === 'acumulado' && (
              <Area type="monotone" dataKey="acumulado" fill="url(#anaAcum)" stroke="none" />
            )}
            <Bar
              dataKey="entradas"
              name="Entradas"
              fill="url(#anaEntradas)"
              radius={[8, 8, 0, 0]}
              maxBarSize={26}
            />
            <Bar
              dataKey="saidas"
              name="Saídas"
              fill="url(#anaSaidas)"
              radius={[8, 8, 0, 0]}
              maxBarSize={26}
            />
            {mode === 'fluxo' ? (
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="#8b5cf6"
                strokeWidth={2.4}
                dot={{ r: 3.2, fill: '#8b5cf6', stroke: 'white', strokeWidth: 1.8 }}
                activeDot={{ r: 5, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="acumulado"
                name="Acumulado"
                stroke="#8b5cf6"
                strokeWidth={2.4}
                strokeDasharray="0"
                dot={{ r: 3, fill: '#8b5cf6', stroke: 'white', strokeWidth: 1.8 }}
                activeDot={{ r: 5, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legenda integrada */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-2.5 border-t text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Entradas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Saídas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-violet-500" />{' '}
            {mode === 'acumulado' ? 'Acumulado' : 'Saldo do mês'}
          </span>
        </div>
      </motion.div>

      {/* Rodapé insights — 4 colunas em desktop, 2 em mobile */}
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Tendência
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${stats.trend >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300'}`}
          >
            {stats.trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}{' '}
            {Math.abs(stats.trend).toFixed(1)}%
          </span>
        </div>
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Melhor mês
          </span>
          <span className="text-xs font-bold flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {stats.best.full} •{' '}
            {formatCurrency(stats.best.saldo)}
          </span>
        </div>
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            Pior mês
          </span>
          <span className="text-xs font-bold flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500" /> {stats.worst.full} •{' '}
            {formatCurrency(stats.worst.saldo)}
          </span>
        </div>
        <div className="rounded-xl border bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 px-3 py-2.5 flex items-center gap-2 text-violet-700 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium leading-tight">
            {mode === 'acumulado'
              ? 'Área roxa = evolução do patrimônio'
              : 'Linha roxa = saldo mensal'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;
