/**
 * @file components/features/BudgetManager/index.tsx
 * @description Gerenciador de orçamento mensal por categoria.
 * Usa API backend (Railway/PostgreSQL) para persistir orçamentos.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAuth } from '../../../contexts/AuthContext';
import { budgetService } from '../../../services/api';
import BudgetSummary from './components/BudgetSummary';
import BudgetCards from './components/BudgetCards';
import BudgetForm from './components/BudgetForm';
import * as C from './styles';
import type { Budget } from '../../../types';

/**
 * Componente principal de gerenciamento de orçamento
 * Carrega orçamentos da API e permite adicionar/remover
 */
const BudgetManager: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const { user } = useAuth();
  const userId = user?.id || '';

  /** Lista de orçamentos carregados da API */
  const [budgets, setBudgets] = useState<Budget[]>([]);
  /** Estado de carregamento (usado internamente) */
  const [, setLoading] = useState(false);

  /** Mês selecionado (formato YYYY-MM) */
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  /**
   * Carrega orçamentos do banco quando o usuário está autenticado
   */
  useEffect(() => {
    if (!userId) return;

    const loadBudgets = async () => {
      setLoading(true);
      try {
        const data = await budgetService.getAll(userId);
        setBudgets(data);
      } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, [userId]);

  /** Orçamentos do mês selecionado */
  const currentBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  /**
   * Calcula gastos por categoria no mês selecionado
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
   * Adiciona um novo orçamento via API
   * @param budget - Dados do orçamento (sem ID)
   */
  const handleAddBudget = useCallback(
    async (budget: Omit<Budget, 'id'>) => {
      try {
        const newBudget = await budgetService.create(budget, userId);
        setBudgets((prev) => [...prev, newBudget]);
      } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        throw error;
      }
    },
    [userId]
  );

  /**
   * Remove um orçamento via API
   * @param id - ID do orçamento a ser removido
   */
  const handleDeleteBudget = useCallback(
    async (id: string) => {
      try {
        await budgetService.delete(id);
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      } catch (error) {
        console.error('Erro ao remover orçamento:', error);
      }
    },
    []
  );

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
        categories={categories}
        currentBudgets={currentBudgets}
        onAddBudget={handleAddBudget}
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
