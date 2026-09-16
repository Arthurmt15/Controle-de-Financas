import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, HandCoins, Hourglass, CalendarCheck, Search, Plus, X, Info } from 'lucide-react';
import DebtForm from '../../components/features/Debts/Form';
import DebtList from '../../components/features/Debts/List';
import { useDebts } from '../../contexts/DebtsContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const DebtsPage: React.FC = () => {
  const { debts } = useDebts();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const metrics = useMemo(() => {
    const active = debts.filter((i) => i.currentInstallment < i.totalInstallments);
    const completed = debts.filter((i) => i.currentInstallment >= i.totalInstallments);
    const totalAmount = debts.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalRemaining = debts.reduce((sum, i) => sum + (i.totalInstallments - i.currentInstallment) * Number(i.installmentAmount), 0);
    const totalPaid = totalAmount - totalRemaining;
    const remainingInstallments = debts.reduce((sum, i) => sum + (i.totalInstallments - i.currentInstallment), 0);
    return { total: debts.length, activeCount: active.length, completedCount: completed.length, totalAmount, totalRemaining, totalPaid, remainingInstallments };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    return debts.filter((inst) => {
      const matchesSearch = !searchTerm || inst.description.toLowerCase().includes(searchTerm.toLowerCase()) || (inst.notes && inst.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const isCompleted = inst.currentInstallment >= inst.totalInstallments;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && !isCompleted) || (statusFilter === 'completed' && isCompleted);
      return matchesSearch && matchesStatus;
    });
  }, [debts, searchTerm, statusFilter]);

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
  const nextDueInfo = useMemo(() => {
    const active = debts.filter((i) => i.currentInstallment < i.totalInstallments);
    if (active.length === 0) return null;
    const withDue = active.map((inst) => ({ inst, dueDate: addMonths(inst.startDate, inst.currentInstallment) }));
    withDue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const nearest = withDue[0];
    const days = getDaysUntil(nearest.dueDate);
    return { debt: nearest.inst, dueDate: nearest.dueDate, dueDateStr: formatDate(nearest.dueDate.toISOString().split('T')[0]), daysUntil: days };
  }, [debts]);

  const summaryCards = [
    { tone: 'slate' as const, icon: Layers, label: 'Total de dívidas', value: String(metrics.total), sub: `${metrics.activeCount} ativas • ${metrics.completedCount} quitadas`, accent: 'bg-slate-500' },
    { tone: 'violet' as const, icon: HandCoins, label: 'Valor total devido', value: formatCurrency(metrics.totalAmount), sub: `${formatCurrency(metrics.totalPaid)} já pagos`, accent: 'bg-violet-500' },
    { tone: 'amber' as const, icon: Hourglass, label: 'Valor restante', value: formatCurrency(metrics.totalRemaining), sub: `${metrics.remainingInstallments} parcelas restantes`, accent: 'bg-amber-500' },
    {
      tone: 'emerald' as const, icon: CalendarCheck, label: 'Próximo pagamento',
      value: nextDueInfo ? nextDueInfo.dueDateStr : 'Nenhum pendente',
      description: nextDueInfo?.debt.description ?? null,
      parcelLabel: nextDueInfo ? `${nextDueInfo.debt.currentInstallment + 1}/${nextDueInfo.debt.totalInstallments}` : null,
      amountLabel: nextDueInfo ? formatCurrency(Number(nextDueInfo.debt.installmentAmount)) : null,
      daysUntil: nextDueInfo?.daysUntil ?? null,
      daysLabel: nextDueInfo ? (nextDueInfo.daysUntil === 0 ? 'vence hoje' : nextDueInfo.daysUntil > 0 ? `em ${nextDueInfo.daysUntil}d` : `vencido há ${Math.abs(nextDueInfo.daysUntil)}d`) : null,
      sub: nextDueInfo ? `${nextDueInfo.debt.currentInstallment + 1}/${nextDueInfo.debt.totalInstallments} • ${formatCurrency(Number(nextDueInfo.debt.installmentAmount))}` : 'Tudo em dia',
      accent: 'bg-emerald-500',
    } as any,
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Dívidas</h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">Controle dívidas divididas — mesma lógica de parcelados. Ao lançar uma transação como dividida, ela aparece aqui automaticamente.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="shrink-0 rounded-xl shadow-sm" size="default">
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? 'Fechar' : 'Nova dívida dividida'}
          </Button>
        </div>
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-3 flex gap-2.5 items-start">
            <span className="mt-0.5 p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0"><Info className="h-3.5 w-3.5" /></span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">Dívidas são criadas manualmente aqui ou automaticamente ao marcar uma transação como “dividida”. Acompanhe progresso e próximos pagamentos.</p>
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
                    <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{card.label}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-[16px] font-bold tracking-tight leading-none">{card.value}</strong>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${(card as any).daysUntil !== null && (card as any).daysUntil < 0 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' : (card as any).daysUntil === 0 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' : (card as any).daysUntil !== null && (card as any).daysUntil <= 7 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'}`}>
                        {(card as any).daysLabel}
                      </span>
                    </div>
                    <p className="text-[12.5px] font-medium leading-tight truncate text-foreground" title={(card as any).description}>{(card as any).description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{(card as any).parcelLabel} • {(card as any).amountLabel}</span>
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
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Buscar por descrição ou observação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10 rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem><SelectItem value="active">Em aberto</SelectItem><SelectItem value="completed">Quitadas</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="justify-center sm:justify-start py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap">{filteredDebts.length} de {debts.length}</Badge>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} transition={{ duration: 0.3 }} className="mt-5 overflow-hidden">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6"><DebtForm onClose={() => setShowForm(false)} /></CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }} className="mt-5">
        <DebtList debts={filteredDebts} />
      </motion.div>
    </div>
  );
};

export default DebtsPage;
