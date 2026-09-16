/**
 * @file pages/Installments/index.tsx
 * @description Página unificada Parcelados & Dívidas — melhor UX sem duplicação.
 * Mostra métricas combinadas, próximo pagamento mais cedo (entre os dois), filtros por tipo e tabs.
 * Ao criar transação como dividida, aparece aqui automaticamente (Dívidas).
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CreditCard, HandCoins, CalendarCheck, Search, Plus, X, Info } from 'lucide-react';
import InstallmentForm from '../../components/features/Installments/Form';
import DebtForm from '../../components/features/Debts/Form';
import InstallmentList from '../../components/features/Installments/List';
import DebtList from '../../components/features/Debts/List';
import { useInstallments } from '../../contexts/InstallmentsContext';
import { useDebts } from '../../contexts/DebtsContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const InstallmentsPage: React.FC = () => {
  const { installments } = useInstallments();
  const { debts } = useDebts();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'installment' | 'debt'>('installment');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'installment' | 'debt'>('all');
  const [activeList, setActiveList] = useState<'all' | 'installment' | 'debt'>('all');

  function addMonths(dateStr: string, months: number): Date {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }
  function getDaysUntil(date: Date): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(date); target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  const metrics = useMemo(() => {
    const all = [...installments, ...debts];
    const activeInst = installments.filter((i) => i.currentInstallment < i.totalInstallments);
    const completedInst = installments.filter((i) => i.currentInstallment >= i.totalInstallments);
    const activeDebts = debts.filter((d) => d.currentInstallment < d.totalInstallments);
    const completedDebts = debts.filter((d) => d.currentInstallment >= d.totalInstallments);
    const totalAmountInst = installments.reduce((s, i) => s + Number(i.totalAmount), 0);
    const totalAmountDebts = debts.reduce((s, d) => s + Number(d.totalAmount), 0);
    const totalRemainingInst = installments.reduce((s, i) => s + (i.totalInstallments - i.currentInstallment) * Number(i.installmentAmount), 0);
    const totalRemainingDebts = debts.reduce((s, d) => s + (d.totalInstallments - d.currentInstallment) * Number(d.installmentAmount), 0);
    return {
      total: all.length,
      parcelados: installments.length,
      dividas: debts.length,
      activeInst: activeInst.length,
      completedInst: completedInst.length,
      activeDebts: activeDebts.length,
      completedDebts: completedDebts.length,
      totalAmount: totalAmountInst + totalAmountDebts,
      totalAmountInst,
      totalAmountDebts,
      totalRemaining: totalRemainingInst + totalRemainingDebts,
      totalRemainingInst,
      totalRemainingDebts,
      totalPaidInst: totalAmountInst - totalRemainingInst,
      totalPaidDebts: totalAmountDebts - totalRemainingDebts,
    };
  }, [installments, debts]);

  const filteredInstallments = useMemo(() => {
    return installments.filter((inst) => {
      const matchesSearch = !searchTerm || inst.description.toLowerCase().includes(searchTerm.toLowerCase()) || (inst.notes && inst.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const isCompleted = inst.currentInstallment >= inst.totalInstallments;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && !isCompleted) || (statusFilter === 'completed' && isCompleted);
      return matchesSearch && matchesStatus;
    });
  }, [installments, searchTerm, statusFilter]);

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const matchesSearch = !searchTerm || debt.description.toLowerCase().includes(searchTerm.toLowerCase()) || (debt.notes && debt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const isCompleted = debt.currentInstallment >= debt.totalInstallments;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && !isCompleted) || (statusFilter === 'completed' && isCompleted);
      return matchesSearch && matchesStatus;
    });
  }, [debts, searchTerm, statusFilter]);

  // Próximo vencimento unificado (mais cedo entre parcelados e dívidas)
  const nextDueUnified = useMemo(() => {
    const activeInst = installments.filter((i) => i.currentInstallment < i.totalInstallments).map((inst) => ({ item: inst, type: 'Parcelado' as const, dueDate: addMonths(inst.startDate, inst.currentInstallment) }));
    const activeDebts = debts.filter((d) => d.currentInstallment < d.totalInstallments).map((debt) => ({ item: debt, type: 'Dívida' as const, dueDate: addMonths(debt.startDate, debt.currentInstallment) }));
    const all = [...activeInst, ...activeDebts];
    if (all.length === 0) return null;
    all.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const nearest = all[0];
    const days = getDaysUntil(nearest.dueDate);
    return {
      ...nearest,
      dueDateStr: formatDate(nearest.dueDate.toISOString().split('T')[0]),
      daysUntil: days,
      description: (nearest.item as any).description,
      amount: (nearest.item as any).installmentAmount,
      parcelLabel: `${(nearest.item as any).currentInstallment + 1}/${(nearest.item as any).totalInstallments}`,
    };
  }, [installments, debts]);

  const summaryCards = [
    {
      tone: 'slate' as const,
      icon: Layers,
      label: 'Compromissos',
      value: String(metrics.total),
      sub: `${metrics.parcelados} parcelados • ${metrics.dividas} dívidas`,
    },
    {
      tone: 'violet' as const,
      icon: CreditCard,
      label: 'Parcelados',
      value: formatCurrency(metrics.totalAmountInst),
      sub: `${metrics.activeInst} ativos • ${formatCurrency(metrics.totalRemainingInst)} restante`,
    },
    {
      tone: 'amber' as const,
      icon: HandCoins,
      label: 'Dívidas divididas',
      value: formatCurrency(metrics.totalAmountDebts),
      sub: `${metrics.activeDebts} ativas • ${formatCurrency(metrics.totalRemainingDebts)} restante`,
    },
    {
      tone: 'emerald' as const,
      icon: CalendarCheck,
      label: 'Próximo pagamento',
      value: nextDueUnified ? nextDueUnified.dueDateStr : 'Nenhum pendente',
      description: nextDueUnified?.description ?? null,
      parcelLabel: nextDueUnified?.parcelLabel ?? null,
      amountLabel: nextDueUnified ? formatCurrency(Number(nextDueUnified.amount)) : null,
      typeLabel: nextDueUnified?.type ?? null,
      daysUntil: nextDueUnified?.daysUntil ?? null,
      daysLabel: nextDueUnified ? (nextDueUnified.daysUntil === 0 ? 'vence hoje' : nextDueUnified.daysUntil > 0 ? `em ${nextDueUnified.daysUntil}d` : `vencido há ${Math.abs(nextDueUnified.daysUntil)}d`) : null,
      sub: nextDueUnified ? `${nextDueUnified.parcelLabel} • ${formatCurrency(Number(nextDueUnified.amount))}` : 'Tudo em dia',
    } as any,
  ];

  const showInstallments = typeFilter === 'all' || typeFilter === 'installment' ? true : false;
  const showDebts = typeFilter === 'all' || typeFilter === 'debt' ? true : false;
  const activeTab = activeList;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Parcelados & Dívidas
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[620px] leading-relaxed">
              Um só lugar para parcelados e dívidas divididas. Ao lançar uma transação como dividida, ela aparece automaticamente aqui.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select value={formType} onValueChange={(v) => setFormType(v as any)}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="installment">Parcelado</SelectItem>
                <SelectItem value="debt">Dívida dividida</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowForm(!showForm)} className="rounded-xl shadow-sm" size="default">
              {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {showForm ? 'Fechar' : `Nova ${formType === 'debt' ? 'dívida' : 'compra'}`}
            </Button>
          </div>
        </div>

        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-3 flex gap-2.5 items-start">
            <span className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0"><Info className="h-3.5 w-3.5" /></span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Parcelados e dívidas compartilham a mesma lógica (parcelas, vencimento, progresso). Use o filtro <strong>Tipo</strong> para ver só um deles. Transações marcadas como divididas viram dívidas automaticamente.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {summaryCards.map((card, idx) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + idx * 0.05 }}>
            <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[118px]">
              <span className="absolute left-0 top-0 bottom-0 w-[3px] opacity-90" style={{ background: card.tone === 'violet' ? 'linear-gradient(180deg,#8b5cf6,#6366f1)' : card.tone === 'amber' ? 'linear-gradient(180deg,#f59e0b,#f97316)' : card.tone === 'emerald' ? 'linear-gradient(180deg,#10b981,#06b6d4)' : 'linear-gradient(180deg,#64748b,#475569)' }} />
              <CardContent className={`p-[18px] flex gap-3.5 ${card.label === 'Próximo pagamento' && (card as any).description ? 'items-start' : 'items-center'}`}>
                <span className={`w-[42px] h-[42px] shrink-0 flex items-center justify-center rounded-xl border text-sm ${card.tone === 'violet' ? 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent' : card.tone === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-transparent' : card.tone === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent'}`}>
                  <card.icon size={16} />
                </span>
                {(card.label === 'Próximo pagamento' && (card as any).description) ? (
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{card.label} <span className="ml-1 inline-flex align-middle text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-muted text-muted-foreground">{(card as any).typeLabel}</span></span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-[16px] font-bold tracking-tight leading-none">{card.value}</strong>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${(card as any).daysUntil !== null && (card as any).daysUntil < 0 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' : (card as any).daysUntil === 0 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' : (card as any).daysUntil !== null && (card as any).daysUntil <= 7 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'}`}>
                        {(card as any).daysLabel}
                      </span>
                    </div>
                    <p className="text-[12.5px] font-medium leading-tight truncate text-foreground" title={(card as any).description}>{(card as any).description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {(card as any).parcelLabel} • {(card as any).amountLabel}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{card.label}</span>
                    <strong className="block mt-1.5 text-[18px] font-bold tracking-tight leading-none truncate" title={String(card.value)}>{card.value}</strong>
                    <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-full">{card.sub}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-5">
        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Buscar por descrição ou observação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10 rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem><SelectItem value="active">Em andamento</SelectItem><SelectItem value="completed">Concluídos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as any); setActiveList(v === 'all' ? 'all' : v === 'installment' ? 'installment' : 'debt'); }}>
              <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-xl"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem><SelectItem value="installment">Só parcelados</SelectItem><SelectItem value="debt">Só dívidas</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="justify-center lg:justify-start py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap">
              {filteredInstallments.length + filteredDebts.length} de {metrics.total}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs de lista — evita duplicação visual */}
      <div className="mt-5 flex justify-center">
        <div className="inline-flex p-1 rounded-full bg-muted border gap-1">
          <button onClick={() => setActiveList('all')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeList === 'all' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Tudo ({metrics.total})</button>
          <button onClick={() => setActiveList('installment')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeList === 'installment' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Parcelados ({installments.length})</button>
          <button onClick={() => setActiveList('debt')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeList === 'debt' ? 'bg-card shadow-sm border text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Dívidas ({debts.length})</button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.3 }} className="mt-5 overflow-hidden">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                {formType === 'debt' ? <DebtForm onClose={() => setShowForm(false)} /> : <InstallmentForm onClose={() => setShowForm(false)} />}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }} className="mt-5 space-y-8">
        {(activeTab === 'all' ? showInstallments : activeTab === 'installment') && (
          <div>
            {(activeTab === 'all' && showDebts) && (
              <h3 className="text-[13px] font-semibold tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" /> Parcelados • {filteredInstallments.length}
              </h3>
            )}
            <InstallmentList installments={filteredInstallments} />
          </div>
        )}
        {(activeTab === 'all' ? showDebts : activeTab === 'debt') && (
          <div>
            {(activeTab === 'all' && showInstallments) && (
              <h3 className="text-[13px] font-semibold tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <HandCoins className="h-3.5 w-3.5" /> Dívidas divididas • {filteredDebts.length}
              </h3>
            )}
            <DebtList debts={filteredDebts} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InstallmentsPage;
