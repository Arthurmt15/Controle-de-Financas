/**
 * @file components/features/Installments/List/index.tsx
 * @description Lista de compras parceladas com visual shadcn + tailwind + framer-motion.
 * Cards com progresso, datas e ações (avançar, editar, excluir) estilizados com
 * design tokens HSL e micro-animações. Substitui styled-components por Tailwind.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import { useInstallments } from '../../../../contexts/InstallmentsContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import InstallmentForm from '../Form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import type { Installment } from '../../../../types';

interface InstallmentListProps {
  /** Lista filtrada opcional; se omitida usa contexto */
  installments?: Installment[];
}

/** Lista de compras parceladas com novo visual */
const InstallmentList: React.FC<InstallmentListProps> = ({ installments: propInstallments }) => {
  // Dados do contexto e categorias para resolver nomes/cores
  const { installments: ctxInstallments, isLoading, deleteInstallment, advanceInstallment } = useInstallments();
  const installments = propInstallments ?? ctxInstallments;
  const { categories } = useTransactions();

  // Estados de modais
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Resolve nome da categoria pelo ID */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /** Resolve cor da categoria pelo ID */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  /** Progresso percentual 0-100 */
  const getProgress = (installment: Installment): number => {
    return (installment.currentInstallment / installment.totalInstallments) * 100;
  };

  /** Valor restante a pagar */
  const getRemainingAmount = (installment: Installment): number => {
    return (installment.totalInstallments - installment.currentInstallment) * installment.installmentAmount;
  };

  /** Soma meses preservando último dia do mês */
  const addMonths = (dateStr: string, months: number): Date => {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  };

  /** Próximo vencimento ou null se concluído */
  const getNextDueDate = (installment: Installment): Date | null => {
    if (installment.currentInstallment >= installment.totalInstallments) return null;
    return addMonths(installment.startDate, installment.currentInstallment);
  };

  /** Dias até a data (zerado à meia-noite) */
  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  };

  /** Confirma exclusão do parcelado */
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteInstallment(deletingId);
      setDeletingId(null);
    }
  };

  /** Avança uma parcela (marca como paga) */
  const handleAdvance = async (id: string) => {
    try {
      await advanceInstallment(id);
    } catch (error) {
      console.error('Erro ao avançar parcela:', error);
    }
  };

  // Estado de carregamento com spinner
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">Carregando parcelados...</p>
        </CardContent>
      </Card>
    );
  }

  // Vazio absoluto (sem nenhum parcelado no sistema)
  if (ctxInstallments.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed bg-muted/20">
        <CardContent className="p-10 text-center flex flex-col items-center gap-3">
          <span className="p-3 rounded-2xl bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </span>
          <p className="text-sm font-semibold">Nenhuma compra parcelada encontrada</p>
          <p className="text-sm text-muted-foreground max-w-md">
            Crie um parcelado para controlar suas prestações ou lance uma transação parcelada.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Vazio filtrado (nenhum resultado para filtro atual)
  if (installments.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="p-10 text-center">
          <p className="text-sm font-semibold">Nenhum parcelado encontrado para o filtro atual.</p>
          <p className="text-sm text-muted-foreground mt-1">Tente ajustar a busca ou o status.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho da lista com contador */}
      <Card className="rounded-2xl">
        <CardHeader className="py-4 px-5">
          <CardTitle className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground">
            Todos os parcelados • {installments.length} {installments.length === 1 ? 'item' : 'itens'}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Grid de cards com animação stagger */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {installments.map((installment, idx) => {
          const progress = getProgress(installment);
          const remaining = getRemainingAmount(installment);
          const isCompleted = installment.currentInstallment >= installment.totalInstallments;
          const nextDue = getNextDueDate(installment);
          const daysUntil = nextDue ? getDaysUntil(nextDue) : null;

          return (
            <motion.div
              key={installment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
            >
              <Card
                className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col h-full ${
                  isCompleted ? 'opacity-70' : ''
                }`}
              >
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  {/* Linha superior: descrição + ações */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Indicador de tipo (bolinha) */}
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" aria-hidden />
                      <span className="text-[15px] font-semibold leading-tight truncate">{installment.description}</span>
                    </div>
                    {/* Botões de ação */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isCompleted && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => handleAdvance(installment.id)}
                          title="Avançar parcela"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => setEditingInstallment(installment)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => setDeletingId(installment.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Linha categoria + data */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getCategoryColor(installment.categoryId) }}
                    >
                      {getCategoryName(installment.categoryId)}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(installment.startDate)}</span>

                  </div>

                  {/* Barra de progresso */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {installment.currentInstallment}/{installment.totalInstallments} parcelas
                    </p>
                  </div>

                  {/* Valores financeiros */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total</p>
                      <p className="text-sm font-semibold mt-1">{formatCurrency(installment.totalAmount)}</p>
                    </div>
                    <div className="border-x px-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Restante</p>
                      <p className="text-sm font-semibold mt-1">{formatCurrency(remaining)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Parcela</p>
                      <p className="text-sm font-semibold mt-1">{formatCurrency(installment.installmentAmount)}</p>
                    </div>
                  </div>

                  {/* Próximo vencimento com cor condicional */}
                  {nextDue ? (
                    <div
                      className={`mt-1 rounded-xl border p-3 flex flex-col gap-0.5 ${
                        daysUntil !== null && daysUntil < 0
                          ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
                          : daysUntil === 0
                            ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                            : daysUntil !== null && daysUntil <= 7
                              ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
                              : 'bg-muted/50 border-border'
                      }`}
                    >
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                        Próximo pagamento
                      </span>
                      <span className="text-[13px] font-semibold">
                        {formatDate(nextDue.toISOString().split('T')[0])} • {installment.currentInstallment + 1}/
                        {installment.totalInstallments}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {daysUntil === 0
                          ? 'Vence hoje'
                          : daysUntil! > 0
                            ? `Em ${daysUntil} dia${daysUntil! > 1 ? 's' : ''}`
                            : `Vencido há ${Math.abs(daysUntil!)} dia${Math.abs(daysUntil!) > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 rounded-xl border bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 p-3">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                        Concluído
                      </span>
                      <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">Todas as parcelas pagas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de edição com Dialog shadcn */}
      <Dialog open={!!editingInstallment} onOpenChange={(open) => !open && setEditingInstallment(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Parcelado</DialogTitle>
            <DialogDescription>Atualize os dados do parcelado e salve as alterações.</DialogDescription>
          </DialogHeader>
          {editingInstallment && (
            <InstallmentForm installment={editingInstallment} onClose={() => setEditingInstallment(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este parcelado? Esta ação não pode ser desfeita.</DialogDescription>
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

export default InstallmentList;
