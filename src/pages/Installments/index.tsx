/**
 * @file pages/Installments/index.tsx
 * @description Página de parcelados redesenhada com shadcn + tailwind + framer-motion.
 * Visual bento alinhado ao Dashboard: heading com gradiente, cards com faixa lateral,
 * filtros em Card e transições suaves. Mantém toda a lógica de métricas e filtros.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CreditCard, Hourglass, CalendarCheck, Search, Plus, X, Info } from 'lucide-react';
import InstallmentForm from '../../components/features/Installments/Form';
import InstallmentList from '../../components/features/Installments/List';
import { useInstallments } from '../../contexts/InstallmentsContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

/** Página de Parcelados - design system shadcn */
const InstallmentsPage: React.FC = () => {
  // Busca parcelados do contexto
  const { installments } = useInstallments();
  // Estado local: visibilidade do formulário, busca e filtro de status
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  /** Calcula métricas resumidas (total, ativos, valores) */
  const metrics = useMemo(() => {
    const active = installments.filter((i) => i.currentInstallment < i.totalInstallments);
    const completed = installments.filter((i) => i.currentInstallment >= i.totalInstallments);
    const totalAmount = installments.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalRemaining = installments.reduce(
      (sum, i) => sum + (i.totalInstallments - i.currentInstallment) * Number(i.installmentAmount),
      0
    );
    const totalPaid = totalAmount - totalRemaining;
    const remainingInstallments = installments.reduce(
      (sum, i) => sum + (i.totalInstallments - i.currentInstallment),
      0
    );
    return {
      total: installments.length,
      activeCount: active.length,
      completedCount: completed.length,
      totalAmount,
      totalRemaining,
      totalPaid,
      remainingInstallments,
    };
  }, [installments]);

  /** Filtra parcelados por busca textual e status */
  const filteredInstallments = useMemo(() => {
    return installments.filter((inst) => {
      const matchesSearch =
        !searchTerm ||
        inst.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst.notes && inst.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const isCompleted = inst.currentInstallment >= inst.totalInstallments;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !isCompleted) ||
        (statusFilter === 'completed' && isCompleted);
      return matchesSearch && matchesStatus;
    });
  }, [installments, searchTerm, statusFilter]);

  /** Adiciona meses preservando último dia do mês */
  function addMonths(dateStr: string, months: number): Date {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }

  /** Dias até a data alvo (diferença em dias inteiros) */
  function getDaysUntil(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /** Encontra próximo vencimento entre parcelados ativos */
  const nextDueInfo = useMemo(() => {
    const active = installments.filter((i) => i.currentInstallment < i.totalInstallments);
    if (active.length === 0) return null;
    const withDue = active.map((inst) => ({
      inst,
      dueDate: addMonths(inst.startDate, inst.currentInstallment),
    }));
    withDue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const nearest = withDue[0];
    const days = getDaysUntil(nearest.dueDate);
    return {
      installment: nearest.inst,
      dueDate: nearest.dueDate,
      dueDateStr: formatDate(nearest.dueDate.toISOString().split('T')[0]),
      daysUntil: days,
    };
  }, [installments]);

  // Configuração dos 4 cards de resumo (tom, ícone e conteúdo)
  const summaryCards = [
    {
      tone: 'slate' as const,
      icon: Layers,
      label: 'Total de parcelados',
      value: String(metrics.total),
      sub: `${metrics.activeCount} ativos • ${metrics.completedCount} concluídos`,
      accent: 'bg-slate-500',
    },
    {
      tone: 'violet' as const,
      icon: CreditCard,
      label: 'Valor total parcelado',
      value: formatCurrency(metrics.totalAmount),
      sub: `${formatCurrency(metrics.totalPaid)} já pagos`,
      accent: 'bg-violet-500',
    },
    {
      tone: 'amber' as const,
      icon: Hourglass,
      label: 'Valor restante',
      value: formatCurrency(metrics.totalRemaining),
      sub: `${metrics.remainingInstallments} parcelas restantes`,
      accent: 'bg-amber-500',
    },
    {
      tone: 'emerald' as const,
      icon: CalendarCheck,
      label: 'Próximo pagamento',
      value: nextDueInfo
        ? `${nextDueInfo.dueDateStr} • ${nextDueInfo.installment.description.slice(0, 18)}${nextDueInfo.installment.description.length > 18 ? '…' : ''}`
        : 'Nenhum pendente',
      sub: nextDueInfo
        ? `${nextDueInfo.installment.currentInstallment + 1}/${nextDueInfo.installment.totalInstallments} • ${formatCurrency(Number(nextDueInfo.installment.installmentAmount))} • ${nextDueInfo.daysUntil === 0 ? 'vence hoje' : nextDueInfo.daysUntil > 0 ? `em ${nextDueInfo.daysUntil}d` : `vencido há ${Math.abs(nextDueInfo.daysUntil)}d`}`
        : 'Tudo em dia',
      accent: 'bg-emerald-500',
    },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho bento com título em gradiente e ação principal */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            {/* Título com gradiente sutil */}
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Parcelados
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
              Visualize e acompanhe todos os seus parcelados em um só lugar
            </p>
          </div>
          {/* Botão de nova compra com animação e ícone dinâmico */}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="shrink-0 rounded-xl shadow-sm"
            size="default"
          >
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? 'Fechar' : 'Nova compra parcelada'}
          </Button>
        </div>

        {/* Hint informativo com borda e ícone */}
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-3 flex gap-2.5 items-start">
            <span className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Info className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Seus parcelados são criados automaticamente ao lançar uma transação parcelada ou manualmente aqui. Acompanhe
              progresso, valor restante e próximas parcelas.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grid de métricas - 4 cards com faixa lateral colorida e ícone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5"
      >
        {summaryCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + idx * 0.05 }}
          >
            <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[118px]">
              {/* Faixa lateral com gradiente por tom */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px] opacity-90"
                style={{
                  background:
                    card.tone === 'violet'
                      ? 'linear-gradient(180deg,#8b5cf6,#6366f1)'
                      : card.tone === 'amber'
                        ? 'linear-gradient(180deg,#f59e0b,#f97316)'
                        : card.tone === 'emerald'
                          ? 'linear-gradient(180deg,#10b981,#06b6d4)'
                          : 'linear-gradient(180deg,#64748b,#475569)',
                }}
              />
              <CardContent className="p-[18px] flex items-center gap-3.5">
                {/* Ícone com fundo tonalizado */}
                <span
                  className={`w-[42px] h-[42px] shrink-0 flex items-center justify-center rounded-xl border text-sm ${
                    card.tone === 'violet'
                      ? 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent'
                      : card.tone === 'amber'
                        ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-transparent'
                        : card.tone === 'emerald'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent'
                          : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent'
                  }`}
                >
                  <card.icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                    {card.label}
                  </span>
                  <strong className="block mt-1.5 text-[18px] font-bold tracking-tight leading-none truncate">
                    {card.value}
                  </strong>
                  <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {card.sub}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Barra de filtros com busca e select shadcn */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-5"
      >
        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Campo de busca com ícone */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por descrição ou observação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
            {/* Select de status (shadcn Radix) */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Em andamento</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
              </SelectContent>
            </Select>
            {/* Contador de resultados */}
            <Badge variant="outline" className="justify-center sm:justify-start py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap">
              {filteredInstallments.length} de {installments.length}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Formulário expansível com animação */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 overflow-hidden"
          >
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <InstallmentForm onClose={() => setShowForm(false)} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de parcelados filtrados */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }} className="mt-5">
        <InstallmentList installments={filteredInstallments} />
      </motion.div>
    </div>
  );
};

export default InstallmentsPage;
