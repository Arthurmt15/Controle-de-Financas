/**
 * @file components/features/BudgetManager/components/BudgetForm.tsx
 * @description Formulário para adicionar novo orçamento mensal.
 * Permite selecionar categoria e definir limite mensal.
 */

import React, { useState } from 'react';
import { useLocalStorage } from '../../../../hooks/useLocalStorage';
import { generateId } from '../../../../utils/helpers';
import Button from '../../../common/Button';
import * as C from './BudgetForm.styles';
import type { Budget, Category } from '../../../../types';

/**
 * Props do componente BudgetForm
 */
interface BudgetFormProps {
  /** Mês selecionado (formato YYYY-MM) */
  selectedMonth: string;
  /** Lista de orçamentos existentes */
  budgets: Budget[];
  /** Função para atualizar orçamentos */
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  /** Lista de categorias disponíveis */
  categories: Category[];
  /** Orçamentos do mês atual */
  currentBudgets: Budget[];
}

/**
 * Formulário de novo orçamento
 * @param {BudgetFormProps} props - Props do componente
 * @returns {JSX.Element} Formulário renderizado
 *
 * @example
 * <BudgetForm
 *   selectedMonth="2026-09"
 *   budgets={budgets}
 *   setBudgets={setBudgets}
 *   categories={categories}
 *   currentBudgets={currentBudgets}
 * />
 */
const BudgetForm: React.FC<BudgetFormProps> = ({
  selectedMonth,
  budgets,
  setBudgets,
  categories,
  currentBudgets,
}) => {
  /** Estado do formulário */
  const [newBudget, setNewBudget] = useState({ categoryId: '', limit: '' });
  /** Mensagem de erro */
  const [error, setError] = useState('');
  /** Controle de visibilidade do formulário */
  const [isAdding, setIsAdding] = useState(false);

  /** Categorias de despesa disponíveis */
  const expenseCategories = categories.filter(
    (c) => c.defaultType === 'expense' || c.defaultType === 'both'
  );

  /** Categorias que ainda não têm orçamento */
  const availableCategories = expenseCategories.filter(
    (c) => !currentBudgets.some((b) => b.categoryId === c.id)
  );

  /**
   * Adiciona um novo orçamento
   * Valida dados, gera ID e salva no estado
   */
  const handleAddBudget = () => {
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

    const budget: Budget = {
      id: generateId(),
      categoryId: newBudget.categoryId,
      limit,
      month: selectedMonth,
    };

    setBudgets((prev) => [...prev, budget]);
    setNewBudget({ categoryId: '', limit: '' });
    setError('');
    setIsAdding(false);
  };

  /**
   * Cancela a adição e reseta o formulário
   */
  const handleCancel = () => {
    setIsAdding(false);
    setError('');
    setNewBudget({ categoryId: '', limit: '' });
  };

  if (!isAdding) {
    if (availableCategories.length === 0) return null;
    return (
      <C.BudgetHeader>
        <C.BudgetTitle>Orçamentos</C.BudgetTitle>
        <Button onClick={() => setIsAdding(true)} size="sm">
          + Novo Orçamento
        </Button>
      </C.BudgetHeader>
    );
  }

  return (
    <C.AddForm>
      <C.FormTitle>Novo Orçamento</C.FormTitle>
      <C.FormFields>
        <C.FormGroup>
          <C.FormLabel>Categoria</C.FormLabel>
          <C.FormSelect
            value={newBudget.categoryId}
            onChange={(e) => {
              setNewBudget((prev) => ({ ...prev, categoryId: e.target.value }));
              setError('');
            }}
          >
            <option value="">Selecione</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </C.FormSelect>
        </C.FormGroup>
        <C.FormGroup>
          <C.FormLabel>Limite Mensal (R$)</C.FormLabel>
          <C.FormInput
            type="number"
            value={newBudget.limit}
            onChange={(e) => {
              setNewBudget((prev) => ({ ...prev, limit: e.target.value }));
              setError('');
            }}
            placeholder="0,00"
            min="0"
            step="0.01"
          />
        </C.FormGroup>
      </C.FormFields>

      {error && <C.ErrorMessage>{error}</C.ErrorMessage>}

      <C.FormActions>
        <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
        <Button onClick={handleAddBudget}>Adicionar</Button>
      </C.FormActions>
    </C.AddForm>
  );
};

export default BudgetForm;
