/**
 * @file components/features/BudgetManager/index.tsx
 * @description Orquestrador de orçamento com shadcn + tailwind + framer-motion.
 * Header com mês, resumo e cards animados.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CalendarDays } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAuth } from '../../../contexts/AuthContext';
import { budgetService } from '../../../services/data';
import BudgetSummary from './components/BudgetSummary';
import BudgetCards from './components/BudgetCards';
import BudgetForm from './components/BudgetForm';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import type { Budget } from '../../../types';

/** Gerenciador de orçamento — shadcn */
const BudgetManager: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const { user, logout } = useAuth();
  const userId = user?.id || '';

  // Lista de orçamentos do usuário
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [, setLoading] = useState(false);

  // Mês selecionado (YYYY-MM)
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  /** Carrega orçamentos do usuário */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const loadBudgets = async () => {
      setLoading(true);
      try {
        const data = await budgetService.getAll(userId);
        if (!cancelled) setBudgets(data);
      } catch (error) {
        if (!cancelled) {
          if (
            error instanceof Error &&
            (error.message.includes('Sessão expirada') ||
              error.message.includes('Faça login') ||
              error.message.includes('Não autenticado'))
          ) {
            logout();
            return;
          }
          console.error('Erro ao carregar orçamentos:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadBudgets();
    return () => {
      cancelled = true;
    };
  }, [userId, logout]);

  /** Filtra orçamentos do mês selecionado */
  const currentBudgets = useMemo(() => budgets.filter((b) => b.month === selectedMonth), [budgets, selectedMonth]);

  /** Calcula gastos por categoria no mês */
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

  /** Cria orçamento via API */
  const handleAddBudget = useCallback(
    async (budget: Omit<Budget, 'id'>) => {
      try {
        const newBudget = await budgetService.create(budget, userId);
        setBudgets((prev) => [...prev, newBudget]);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Sessão expirada') ||
            error.message.includes('Faça login') ||
            error.message.includes('Não autenticado'))
        ) {
          logout();
          throw error;
        }
        console.error('Erro ao criar orçamento:', error);
        throw error;
      }
    },
    [userId, logout]
  );

  /** Remove orçamento */
  const handleDeleteBudget = useCallback(
    async (id: string) => {
      try {
        await budgetService.delete(id);
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('Sessão expirada') ||
            error.message.includes('Faça login') ||
            error.message.includes('Não autenticado'))
        ) {
          logout();
          throw error;
        }
        console.error('Erro ao remover orçamento:', error);
      }
    },
    [logout]
  );

  return (
    <div className="space-y-5">
      {/* Cabeçalho com título e seletor de mês */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-transparent">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight leading-none">Orçamento mensal</h2>
            <p className="text-xs text-muted-foreground mt-1">Controle de limites por categoria</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full hidden sm:inline-flex gap-1.5">
            <CalendarDays className="h-3 w-3" />
            {selectedMonth}
          </Badge>
          <div className="space-y-1">
            <Label htmlFor="budget-month" className="text-[11px] text-muted-foreground sr-only">
              Mês
            </Label>
            <Input
              id="budget-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-xl w-[160px]"
            />
          </div>
        </div>
      </div>

      {/* Resumo geral */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <BudgetSummary totalBudget={totalBudget} totalSpent={totalSpent} />
      </motion.div>

      {/* Formulário de novo orçamento */}
      <Card className="rounded-2xl border-dashed bg-muted/20">
        <CardContent className="p-4 sm:p-5">
          <BudgetForm
            selectedMonth={selectedMonth}
            categories={categories}
            currentBudgets={currentBudgets}
            onAddBudget={handleAddBudget}
          />
        </CardContent>
      </Card>

      {/* Cards por categoria */}
      <BudgetCards budgets={currentBudgets} categorySpending={categorySpending} categories={categories} onDelete={handleDeleteBudget} />
    </div>
  );
};

export default BudgetManager;
