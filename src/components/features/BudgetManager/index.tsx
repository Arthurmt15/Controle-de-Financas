import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAuth } from '../../../contexts/AuthContext';
import { budgetService } from '../../../services/data';
import BudgetSummary from './components/BudgetSummary';
import BudgetCards from './components/BudgetCards';
import BudgetForm from './components/BudgetForm';
import * as C from './styles';
import type { Budget } from '../../../types';

const BudgetManager: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const { user, logout } = useAuth();
  const userId = user?.id || '';

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [, setLoading] = useState(false);

  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadBudgets = async () => {
      setLoading(true);
      try {
        const data = await budgetService.getAll(userId);
        if (!cancelled) {
          setBudgets(data);
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error &&
              (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
            logout();
            return;
          }
          console.error('Erro ao carregar orçamentos:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBudgets();
    return () => { cancelled = true; };
  }, [userId, logout]);

  const currentBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

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

  const totalBudget = currentBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = Object.values(categorySpending).reduce((sum, v) => sum + v, 0);

  const handleAddBudget = useCallback(
    async (budget: Omit<Budget, 'id'>) => {
      try {
        const newBudget = await budgetService.create(budget, userId);
        setBudgets((prev) => [...prev, newBudget]);
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        console.error('Erro ao criar orçamento:', error);
        throw error;
      }
    },
    [userId, logout]
  );

  const handleDeleteBudget = useCallback(
    async (id: string) => {
      try {
        await budgetService.delete(id);
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        console.error('Erro ao remover orçamento:', error);
      }
    },
    [logout]
  );

  return (
    <C.Container>
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

      <BudgetSummary totalBudget={totalBudget} totalSpent={totalSpent} />

      <BudgetForm
        selectedMonth={selectedMonth}
        categories={categories}
        currentBudgets={currentBudgets}
        onAddBudget={handleAddBudget}
      />

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
