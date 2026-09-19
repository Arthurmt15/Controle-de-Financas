import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import { useDebts } from '../../../../contexts/DebtsContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import DebtForm from '../Form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../ui/dialog';
import type { Debt } from '../../../../types';

interface DebtListProps {
  debts?: Debt[];
}

const DebtList: React.FC<DebtListProps> = ({ debts: propDebts }) => {
  const { debts: ctxDebts, isLoading, deleteDebt, advanceDebt } = useDebts();
  const debts = propDebts ?? ctxDebts;
  const { categories } = useTransactions();

  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };
  const getProgress = (debt: Debt): number =>
    (debt.currentInstallment / debt.totalInstallments) * 100;
  const getRemainingAmount = (debt: Debt): number =>
    (debt.totalInstallments - debt.currentInstallment) * debt.installmentAmount;
  const addMonths = (dateStr: string, months: number): Date => {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  };
  const getNextDueDate = (debt: Debt): Date | null => {
    if (debt.currentInstallment >= debt.totalInstallments) return null;
    return addMonths(debt.startDate, debt.currentInstallment);
  };
  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  };
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteDebt(deletingId);
      setDeletingId(null);
    }
  };
  const handleAdvance = async (id: string) => {
    try {
      await advanceDebt(id);
    } catch (error) {
      console.error('Erro ao avançar dívida:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">Carregando dívidas...</p>
        </CardContent>
      </Card>
    );
  }

  if (ctxDebts.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed bg-muted/20">
        <CardContent className="p-10 text-center flex flex-col items-center gap-3">
          <span className="p-3 rounded-2xl bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </span>
          <p className="text-sm font-semibold">Nenhuma dívida dividida encontrada</p>
          <p className="text-sm text-muted-foreground max-w-md">
            Crie uma dívida ou marque uma transação como dividida para acompanhar aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (debts.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="p-10 text-center">
          <p className="text-sm font-semibold">Nenhuma dívida encontrada para o filtro atual.</p>
          <p className="text-sm text-muted-foreground mt-1">Tente ajustar a busca ou o status.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader className="py-4 px-5">
          <CardTitle className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground">
            Todas as dívidas • {debts.length} {debts.length === 1 ? 'item' : 'itens'}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {debts.map((debt, idx) => {
          const progress = getProgress(debt);
          const remaining = getRemainingAmount(debt);
          const isCompleted = debt.currentInstallment >= debt.totalInstallments;
          const nextDue = getNextDueDate(debt);
          const daysUntil = nextDue ? getDaysUntil(nextDue) : null;
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
            >
              <Card
                className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col h-full ${isCompleted ? 'opacity-70' : ''}`}
              >
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden />
                      <span className="text-[15px] font-semibold leading-tight truncate">
                        {debt.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isCompleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => handleAdvance(debt.id)}
                          title="Avançar parcela"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => setEditingDebt(debt)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => setDeletingId(debt.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getCategoryColor(debt.categoryId) }}
                    >
                      {getCategoryName(debt.categoryId)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(debt.startDate)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {debt.currentInstallment}/{debt.totalInstallments} parcelas
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Total
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(debt.totalAmount)}
                      </p>
                    </div>
                    <div className="border-x px-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Restante
                      </p>
                      <p className="text-sm font-semibold mt-1">{formatCurrency(remaining)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Parcela
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(debt.installmentAmount)}
                      </p>
                    </div>
                  </div>

                  {nextDue ? (
                    <div
                      className={`mt-1 rounded-xl border p-3 flex flex-col gap-2 ${daysUntil !== null && daysUntil < 0 ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' : daysUntil === 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : daysUntil !== null && daysUntil <= 7 ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' : 'bg-muted/40 border-border'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{' '}
                          Próximo pagamento
                        </span>
                        <span
                          className={`shrink-0 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${daysUntil !== null && daysUntil < 0 ? 'bg-white/70 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/20' : daysUntil === 0 ? 'bg-white/70 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20' : daysUntil !== null && daysUntil <= 7 ? 'bg-white/70 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20' : 'bg-white/70 text-muted-foreground border-border'}`}
                        >
                          {daysUntil === 0
                            ? 'Vence hoje'
                            : daysUntil! > 0
                              ? `Em ${daysUntil} dia${daysUntil! > 1 ? 's' : ''}`
                              : `Vencido há ${Math.abs(daysUntil!)} dia${Math.abs(daysUntil!) > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <span className="text-[14px] font-bold tracking-tight leading-none">
                          {formatDate(nextDue.toISOString().split('T')[0])}
                        </span>
                        <span className="text-[12px] font-medium text-muted-foreground bg-background/60 border px-2 py-0.5 rounded-full">
                          {debt.currentInstallment + 1}/{debt.totalInstallments} •{' '}
                          {formatCurrency(debt.installmentAmount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 rounded-xl border bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 p-3">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                        Concluído
                      </span>
                      <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">
                        Todas as parcelas pagas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!editingDebt} onOpenChange={(open) => !open && setEditingDebt(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Dívida</DialogTitle>
            <DialogDescription>
              Atualize os dados da dívida e salve as alterações.
            </DialogDescription>
          </DialogHeader>
          {editingDebt && <DebtForm debt={editingDebt} onClose={() => setEditingDebt(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta dívida? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DebtList;
