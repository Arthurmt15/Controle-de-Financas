/**
 * @file components/features/BudgetManager/components/BudgetForm.tsx
 * @description Formulário de novo orçamento com shadcn + tailwind + framer-motion + lucide.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, Wallet } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { Budget, Category } from '../../../../types';

/** Props do form */
interface BudgetFormProps {
  selectedMonth: string;
  categories: Category[];
  currentBudgets: Budget[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
}

/** Formulário de novo orçamento — shadcn */
const BudgetForm: React.FC<BudgetFormProps> = ({ selectedMonth, categories, currentBudgets, onAddBudget }) => {
  // Estado do formulário
  const [newBudget, setNewBudget] = useState({ categoryId: '', limit: '' });
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categorias de despesa e disponíveis
  const expenseCategories = categories.filter((c) => c.defaultType === 'expense' || c.defaultType === 'both');
  const availableCategories = expenseCategories.filter((c) => !currentBudgets.some((b) => b.categoryId === c.id));

  /** Valida e envia novo orçamento */
  const handleAddBudget = async () => {
    if (!newBudget.categoryId) {
      setError('Selecione uma categoria');
      return;
    }
    const limit = parseFloat(newBudget.limit);
    if (!limit || limit <= 0) {
      setError('Informe um limite válido');
      return;
    }
    const exists = currentBudgets.some((b) => b.categoryId === newBudget.categoryId);
    if (exists) {
      setError('Já existe um orçamento para esta categoria');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddBudget({ categoryId: newBudget.categoryId, limit, month: selectedMonth });
      setNewBudget({ categoryId: '', limit: '' });
      setError('');
      setIsAdding(false);
    } catch {
      setError('Erro ao salvar orçamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Cancela e reseta */
  const handleCancel = () => {
    setIsAdding(false);
    setError('');
    setNewBudget({ categoryId: '', limit: '' });
  };

  // Botão inicial quando não está adicionando
  if (!isAdding) {
    if (availableCategories.length === 0) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          Todas as categorias já possuem orçamento neste mês.
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Wallet className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">Orçamentos</h3>
        </div>
        <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" />
          Novo orçamento
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Novo orçamento
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Categoria — Select shadcn */}
          <div className="space-y-1.5">
            <Label className="text-xs">Categoria</Label>
            <Select
              value={newBudget.categoryId}
              onValueChange={(v) => {
                setNewBudget((prev) => ({ ...prev, categoryId: v }));
                setError('');
              }}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Limite — Input shadcn */}
          <div className="space-y-1.5">
            <Label className="text-xs">Limite mensal (R$)</Label>
            <Input
              type="number"
              value={newBudget.limit}
              onChange={(e) => {
                setNewBudget((prev) => ({ ...prev, limit: e.target.value }));
                setError('');
              }}
              placeholder="0,00"
              min="0"
              step="0.01"
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Erro */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex gap-2 items-center text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel} className="rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleAddBudget} isLoading={isSubmitting} className="rounded-xl">
            Adicionar
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BudgetForm;
