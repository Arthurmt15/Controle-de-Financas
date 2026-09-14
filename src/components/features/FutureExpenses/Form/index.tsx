/**
 * @file components/features/FutureExpenses/Form/index.tsx
 * @description Formulário para criar e editar despesas futuras.
 * Permite planejar gastos que ainda vão acontecer.
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../common/Input';
import Select from '../../../common/Select';
import Button from '../../../common/Button';
import { useFutureExpenses } from '../../../../contexts/FutureExpensesContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import * as C from './styles';
import type { FutureExpense } from '../../../../types';

/** Props do componente */
interface FutureExpenseFormProps {
  expense?: FutureExpense | null;
  onClose?: () => void;
}

/** Formulário de despesas futuras */
const FutureExpenseForm: React.FC<FutureExpenseFormProps> = ({
  expense = null,
  onClose,
}) => {
  const { addFutureExpense, updateFutureExpense } = useFutureExpenses();
  const { categories } = useTransactions();

  /** Estado do formulário */
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    categoryId: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Preenche o formulário ao editar */
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

  /** Atualiza campo do formulário */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Valida e envia o formulário */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que 0';
    }
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

      if (expense) {
        await updateFutureExpense({ ...expenseData, id: expense.id });
      } else {
        await addFutureExpense(expenseData);
      }

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

  /** Filtra categorias de despesa */
  const expenseCategories = categories.filter(
    (cat) => cat.defaultType === 'expense' || cat.defaultType === 'both'
  );

  return (
    <C.Form onSubmit={handleSubmit}>
      <C.FormTitle>
        {expense ? 'Editar Despesa Futura' : 'Nova Despesa Futura'}
      </C.FormTitle>

      <C.FieldsContainer>
        <Input
          name="description"
          label="Descrição"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: IPVA 2027"
          error={errors.description}
          required
        />

        <Input
          name="amount"
          label="Valor Previsto"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0,00"
          error={errors.amount}
          required
        />

        <Select
          name="categoryId"
          label="Categoria"
          value={formData.categoryId}
          onChange={handleChange}
          options={expenseCategories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
          placeholder="Selecione uma categoria"
          error={errors.categoryId}
          required
        />

        <Input
          name="expectedDate"
          label="Data Prevista"
          type="date"
          value={formData.expectedDate}
          onChange={handleChange}
          error={errors.expectedDate}
          required
        />

        <C.TextareaContainer>
          <C.TextareaLabel>Observações (opcional)</C.TextareaLabel>
          <C.Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Adicione detalhes..."
            rows={3}
          />
        </C.TextareaContainer>
      </C.FieldsContainer>

      <C.Actions>
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {expense ? 'Salvar Alterações' : 'Criar Despesa Futura'}
        </Button>
      </C.Actions>
    </C.Form>
  );
};

export default FutureExpenseForm;
