/**
 * @file components/features/Debts/Form/index.tsx
 * @description Formulário de dívidas divididas - mesma lógica de Installments.
 */

import React, { useState, useEffect } from 'react';
import { HandCoins, Save, X } from 'lucide-react';
import { useDebts } from '../../../../contexts/DebtsContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Button } from '../../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { Debt } from '../../../../types';

interface DebtFormProps {
  debt?: Debt | null;
  onClose?: () => void;
}

const DebtForm: React.FC<DebtFormProps> = ({ debt = null, onClose }) => {
  const { addDebt, updateDebt } = useDebts();
  const { categories, addTransaction } = useTransactions();

  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    totalInstallments: '12',
    startDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (debt) {
      setFormData({
        description: debt.description,
        totalAmount: String(debt.totalAmount),
        totalInstallments: String(debt.totalInstallments),
        startDate: debt.startDate,
        categoryId: debt.categoryId,
        notes: debt.notes || '',
      });
    }
  }, [debt]);

  const installmentAmount =
    formData.totalAmount && formData.totalInstallments
      ? parseFloat(formData.totalAmount) / parseInt(formData.totalInstallments, 10)
      : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) newErrors.totalAmount = 'Valor deve ser maior que 0';
    if (parseInt(formData.totalInstallments, 10) <= 0) newErrors.totalInstallments = 'Deve ter pelo menos 1 parcela';
    if (!formData.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
    if (!formData.startDate) newErrors.startDate = 'Data é obrigatória';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      const total = parseFloat(formData.totalAmount);
      const parcels = parseInt(formData.totalInstallments, 10);
      const debtData = {
        description: formData.description.trim(),
        totalAmount: total,
        installmentAmount: total / parcels,
        totalInstallments: parcels,
        currentInstallment: debt ? debt.currentInstallment : 0,
        startDate: formData.startDate,
        categoryId: formData.categoryId,
        notes: formData.notes.trim() || undefined,
        source: 'manual' as const,
      };

      if (debt) {
        await updateDebt({ ...debtData, id: debt.id });
      } else {
        await addDebt(debtData);
        try {
          await addTransaction({
            description: `${formData.description.trim()} (1/${parcels}) [Dívida]`,
            amount: total / parcels,
            type: 'expense',
            date: new Date(formData.startDate).toISOString(),
            categoryId: formData.categoryId,
            notes: formData.notes.trim() ? `Dívida dividida ${parcels}x - ${formData.notes.trim()}` : `Dívida dividida ${parcels}x - ${formData.description.trim()}`,
          });
        } catch (txError) {
          console.error('Dívida criada, mas falhou ao criar transação da 1ª parcela:', txError);
        }
      }

      setFormData({
        description: '',
        totalAmount: '',
        totalInstallments: '12',
        startDate: new Date().toISOString().split('T')[0],
        categoryId: '',
        notes: '',
      });
      setErrors({});
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar dívida:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((cat) => cat.defaultType === 'expense' || cat.defaultType === 'both');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
          <HandCoins className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight">
          {debt ? 'Editar Dívida' : 'Nova Dívida Dividida'}
        </h3>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
          <Input id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Ex: Jantar dividido com João" error={errors.description} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalAmount">Valor Total <span className="text-red-500">*</span></Label>
            <Input id="totalAmount" name="totalAmount" type="number" step="0.01" value={formData.totalAmount} onChange={handleChange} placeholder="0,00" error={errors.totalAmount} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="totalInstallments">Nº de Parcelas <span className="text-red-500">*</span></Label>
            <Input id="totalInstallments" name="totalInstallments" type="number" min={1} value={formData.totalInstallments} onChange={handleChange} placeholder="12" error={errors.totalInstallments} />
          </div>
        </div>

        {installmentAmount > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <HandCoins className="h-4 w-4" />
            Cada parcela: R$ {installmentAmount.toFixed(2)}
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Categoria <span className="text-red-500">*</span></Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="startDate">Data da Primeira Parcela <span className="text-red-500">*</span></Label>
          <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} error={errors.startDate} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Ex: Dividido com 3 pessoas, cada um R$..." rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} className="rounded-xl">
          <Save className="mr-2 h-4 w-4" />
          {debt ? 'Salvar Alterações' : 'Criar Dívida'}
        </Button>
      </div>
    </form>
  );
};

export default DebtForm;
