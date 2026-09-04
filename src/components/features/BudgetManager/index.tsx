/**
 * @file components/features/BudgetManager/index.tsx
 * @description Gerenciador de orçamento mensal por categoria.
 * Permite definir limites mensais e acompanhar gastos por categoria.
 */

import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { getMonthName } from '../../../utils/formatters';
import BudgetSummary from './components/BudgetSummary';
import BudgetCards from './components/BudgetCards';
import BudgetForm from './components/BudgetForm';
import * as C from './styles';
import type { Budget } from '../../../types';

/**
 * Componente principal de gerenciamento de orçamento
 * @returns {JSX.Element} Gerenciador de orçamento renderizado
 *
 * @example
 * <BudgetManager />
 */
const BudgetManager: React.FC = () => {
  const { transactions, categories } = useTransactions();
  /** Orçamentos persistidos no localStorage */
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('financas_budgets', []);

  /** Mês selecionado (formato YYYY-MM) */
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  /**
   * Calcula o nome do mês selecionado
   * @returns Nome do mês por extenso + ano
   */
  const monthName = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return `${getMonthName(parseInt(month) - 1)} ${year}`;
  }, [selectedMonth]);

  /** Orçamentos do mês selecionado */
  const currentBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  /**
   * Calcula gastos por categoria no mês selecionado
   * @returns Objeto com {categoryId: valorGasto}
   */
  const categorySpending = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const spending: Record<string, number> = {};
    expenses.forEach((t) => {
      spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount;
    });
    return spending;
  }, [transactions, selectedMonth]);

  /** Total do orçamento do mês */
  const totalBudget = currentBudgets.reduce((sum, b) => sum + b.limit, 0);
  /** Total gasto no mês */
  const totalSpent = Object.values(categorySpending).reduce((sum, v) => sum + v, 0);

  /**
   * Remove um orçamento pelo ID
   * @param id - ID do orçamento a ser removido
   */
  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <C.Container>
      {/* Cabeçalho com título e seletor de mês */}
      <C.Header>
        <C.Title>Orçamento Mensal</C.Title>
        <C.MonthSelector>
          <C.MonthInput
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </C.MonthSelector>
      </C.Header>

      {/* Resumo geral do orçamento */}
      <BudgetSummary totalBudget={totalBudget} totalSpent={totalSpent} />

      {/* Formulário para novo orçamento */}
      <BudgetForm
        selectedMonth={selectedMonth}
        budgets={budgets}
        setBudgets={setBudgets}
        categories={categories}
        currentBudgets={currentBudgets}
      />

      {/* Cards de orçamento por categoria */}
      <BudgetCards
        budgets={currentBudgets}
        categorySpending={categorySpending}
        categories={categories}
        onDelete={handleDeleteBudget}
      />
    </C.Container>
  );
};

export default BudgetManager;
