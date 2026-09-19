/**
 * @file components/features/FutureExpenses/List/index.tsx
 * @description Lista de despesas futuras com visual shadcn + tailwind + framer-motion.
 * Tabs para status, cards/lista com urgência colorida e Dialogs para edição/exclusão.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pencil, Trash2, Clock, AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { useFutureExpenses } from '../../../../contexts/FutureExpensesContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import FutureExpenseForm from '../Form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../ui/dialog';
import type { FutureExpense } from '../../../../types';

/** Lista de despesas futuras */
const FutureExpenseList: React.FC = () => {
  const { futureExpenses, isLoading, deleteFutureExpense, markAsPaid } = useFutureExpenses();
  const { categories } = useTransactions();

  const [editingExpense, setEditingExpense] = useState<FutureExpense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'cancelled'>('pending');

  /** Nome da categoria */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };
  /** Cor da categoria */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const filteredExpenses = futureExpenses.filter((e) => e.status === activeTab);
  const totalPending = futureExpenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaid = futureExpenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteFutureExpense(deletingId);
      setDeletingId(null);
    }
  };
  const handleMarkAsPaid = async (id: string) => {
    try {
      await markAsPaid(id);
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium">Carregando despesas futuras...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com resumo */}
      <Card className="rounded-2xl">
        <CardHeader className="py-4 px-5 flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground">
            Despesas Futuras
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              Pendente: {formatCurrency(totalPending)}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-xs bg-emerald-50 border-emerald-200 text-emerald-700"
            >
              Pago: {formatCurrency(totalPaid)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs shadcn-style com Buttons */}
      <Card className="rounded-2xl">
        <CardContent className="p-2 flex gap-2 flex-wrap">
          {[
            {
              id: 'pending',
              label: 'Pendentes',
              count: futureExpenses.filter((e) => e.status === 'pending').length,
            },
            {
              id: 'paid',
              label: 'Pagas',
              count: futureExpenses.filter((e) => e.status === 'paid').length,
            },
            {
              id: 'cancelled',
              label: 'Canceladas',
              count: futureExpenses.filter((e) => e.status === 'cancelled').length,
            },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="rounded-full px-4"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {filteredExpenses.length === 0 ? (
        <Card className="rounded-2xl border-dashed bg-muted/20">
          <CardContent className="p-10 text-center flex flex-col items-center gap-3">
            <span className="p-3 rounded-2xl bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </span>
            <p className="text-sm font-semibold">
              Nenhuma despesa{' '}
              {activeTab === 'pending' ? 'pendente' : activeTab === 'paid' ? 'paga' : 'cancelada'}
            </p>
            <p className="text-sm text-muted-foreground">
              Crie uma nova despesa futura para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredExpenses.map((expense, idx) => {
            const daysUntil = Math.ceil(
              (new Date(expense.expectedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isUrgent = daysUntil <= 7 && daysUntil >= 0;
            const isOverdue = daysUntil < 0;

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`rounded-2xl shadow-sm hover:shadow-md transition-all ${isUrgent ? 'border-amber-200 bg-amber-50/40 dark:bg-amber-500/5' : isOverdue ? 'border-red-200 bg-red-50/40 dark:bg-red-500/5' : ''}`}
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span className="text-[15px] font-semibold truncate">
                          {expense.description}
                        </span>
                        {isUrgent && (
                          <Badge variant="warning" className="gap-1 px-2 py-0 text-[11px]">
                            <AlertTriangle className="h-3 w-3" />
                            Urgente
                          </Badge>
                        )}
                        {isOverdue && activeTab === 'pending' && (
                          <Badge variant="destructive" className="px-2 py-0 text-[11px]">
                            Vencido
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span
                          className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
                        >
                          {getCategoryName(expense.categoryId)}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(expense.expectedDate)}
                        </span>
                        {activeTab === 'pending' && (
                          <span
                            className={`font-medium ${isUrgent ? 'text-amber-600' : isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}
                          >
                            {daysUntil <= 0
                              ? 'Vencido'
                              : daysUntil === 1
                                ? 'Amanhã'
                                : `Em ${daysUntil} dias`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Valor + ações */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[15px] font-bold">
                        {formatCurrency(expense.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        {activeTab === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => handleMarkAsPaid(expense.id)}
                            title="Marcar como paga"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setEditingExpense(expense)}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeletingId(expense.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog edição */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Despesa Futura</DialogTitle>
            <DialogDescription>Atualize os dados e salve.</DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <FutureExpenseForm expense={editingExpense} onClose={() => setEditingExpense(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog exclusão */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta despesa futura? Esta ação não pode ser desfeita.
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

export default FutureExpenseList;
