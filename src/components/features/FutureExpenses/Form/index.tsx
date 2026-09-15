/**
 * @file components/features/FutureExpenses/Form/index.tsx
 * @description Formulário de despesas futuras com shadcn + tailwind.
 * Usa Input, Select (Radix), Textarea e Button do design system com comentários.
 */

import React, { useState, useEffect } from 'react';
import { Calculator, Save, X } from 'lucide-react';
import { useFutureExpenses } from '../../../../contexts/FutureExpensesContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Button } from '../../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { FutureExpense } from '../../../../types';

/** Props do formulário */
interface FutureExpenseFormProps {
  /** Despesa existente para edição */
  expense?: FutureExpense | null;
  onClose?: () => void;
}

/** Formulário de despesas futuras */
const FutureExpenseForm: React.FC<FutureExpenseFormProps> = ({ expense = null, onClose }) => {
  const { addFutureExpense, updateFutureExpense } = useFutureExpenses();
  const { categories } = useTransactions();

  // Estado controlado
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    categoryId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Preenche ao editar */
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: String(expense.amount),
        expectedDate: expense.expectedDate,
        categoryId: expense.categoryId,
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  /** Atualiza campo texto */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Atualiza categoria via Radix Select */
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
  };

  /** Valida e envia */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valor deve ser maior que 0';
    if (!formData.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
    if (!formData.expectedDate) newErrors.expectedDate = 'Data prevista é obrigatória';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const expenseData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        expectedDate: formData.expectedDate,
        categoryId: formData.categoryId,
        notes: formData.notes.trim() || undefined,
        status: 'pending' as const,
      };
      if (expense) await updateFutureExpense({ ...expenseData, id: expense.id });
      else await addFutureExpense(expenseData);
      setFormData({
        description: '',
        amount: '',
        expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        categoryId: '',
        notes: '',
      });
      setErrors({});
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar despesa futura:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((cat) => cat.defaultType === 'expense' || cat.defaultType === 'both');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Título */}
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-primary/10 text-primary">
          <Calculator className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight">{expense ? 'Editar Despesa Futura' : 'Nova Despesa Futura'}</h3>
      </div>

      <div className="grid gap-4">
        {/* Descrição */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ex: IPVA 2027"
            error={errors.description}
          />
        </div>

        {/* Valor + Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">
              Valor Previsto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0,00"
              error={errors.amount}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expectedDate">
              Data Prevista <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expectedDate"
              name="expectedDate"
              type="date"
              value={formData.expectedDate}
              onChange={handleChange}
              error={errors.expectedDate}
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-1.5">
          <Label>
            Categoria <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className={errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs font-medium text-red-500">{errors.categoryId}</p>}
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Adicione detalhes..."
            rows={3}
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} className="rounded-xl">
          <Save className="mr-2 h-4 w-4" />
          {expense ? 'Salvar Alterações' : 'Criar Despesa Futura'}
        </Button>
      </div>
    </form>
  );
};

export default FutureExpenseForm;
