/**
 * @file pages/Reports/index.tsx
 * @description Página de relatórios financeiros com filtros avançados e gráficos.
 * Exibe resumo, tendências, distribuição por categorias e maiores despesas.
 */

import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDate, getMonthAbbreviation } from '../../utils/formatters';
import { getLastNMonths } from '../../utils/helpers';
import { exportTransactionsCSV, exportTransactionsPDF } from '../../utils/exportData';
import SummaryCards from '../../components/features/Reports/components/SummaryCards';
import ReportsCharts from '../../components/features/Reports/components/ReportsCharts';
import TopExpensesTable from '../../components/features/Reports/components/TopExpensesTable';
import * as C from './styles';

/**
 * Página de Relatórios
 * @returns {JSX.Element} Página renderizada com filtros, gráficos e tabelas
 *
 * @example
 * <ReportsPage />
 */
const ReportsPage: React.FC = () => {
  const { transactions, categories } = useTransactions();

  /** Estado dos filtros de período */
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  /** Filtro de tipo (entradas/saídas/ambos) */
  const [selectedType, setSelectedType] = useState<'both' | 'income' | 'expense'>('both');
  /** Filtro de categoria */
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  /**
   * Filtra transações por período, tipo e categoria
   * @returns Array de transações filtradas
   */
  const filteredByDate = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

      if (start && date < start) return false;
      if (end && date > end) return false;
      if (selectedType !== 'both' && t.type !== selectedType) return false;
      if (selectedCategoryId && t.categoryId !== selectedCategoryId) return false;
      return true;
    });
  }, [transactions, dateRange, selectedType, selectedCategoryId]);

  /**
   * Calcula resumo financeiro do período
   * @returns Objeto com totais de entrada, saída e saldo
   */
  const summary = useMemo(() => {
    const income = filteredByDate
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredByDate
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredByDate]);

  /**
   * Prepara dados para gráfico de barras mensal (12 meses)
   */
  const monthlyData = useMemo(() => {
    return getLastNMonths(12).map(({ month, year, name }) => {
      const monthTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      return {
        name: getMonthAbbreviation(month),
        entradas: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        saidas: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  /**
   * Prepara dados para gráfico de pizza de despesas por categoria
   */
  const categoryData = useMemo(() => {
    const expenses = filteredByDate.filter((t) => t.type === 'expense');
    const totals = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || 'Outros', value, color: cat?.color || '#6b7280' };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredByDate, categories]);

  /**
   * Prepara dados para gráfico de pizza de receitas por categoria
   */
  const incomeCategoryData = useMemo(() => {
    const incomes = filteredByDate.filter((t) => t.type === 'income');
    const totals = incomes.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals)
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || 'Outros', value, color: cat?.color || '#10b981' };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredByDate, categories]);

  /**
   * Prepara dados para gráfico de tendência diária (últimos 30 dias)
   */
  const dailyTrend = useMemo(() => {
    const dailyMap: Record<string, { income: number; expense: number }> = {};
    filteredByDate.forEach((t) => {
      const day = t.date.split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { income: 0, expense: 0 };
      if (t.type === 'income') dailyMap[day].income += t.amount;
      else dailyMap[day].expense += t.amount;
    });

    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, data]) => ({
        name: formatDate(date),
        entradas: data.income,
        saidas: data.expense,
      }));
  }, [filteredByDate]);

  return (
    <C.Container>
      {/* Cabeçalho com título e botões de exportação */}
      <C.Header>
        <C.Title>Relatórios</C.Title>
        <C.ExportButtons>
          <C.ExportButton onClick={() => exportTransactionsCSV({ transactions: filteredByDate, categories })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            CSV
          </C.ExportButton>
          <C.ExportButton onClick={() => exportTransactionsPDF({ transactions: filteredByDate, categories })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            PDF
          </C.ExportButton>
        </C.ExportButtons>
      </C.Header>

      {/* Barra de filtros */}
      <C.FiltersBar>
        <C.FilterGroup>
          <C.FilterLabel>Data Início</C.FilterLabel>
          <C.FilterInput
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </C.FilterGroup>
        <C.FilterGroup>
          <C.FilterLabel>Data Fim</C.FilterLabel>
          <C.FilterInput
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </C.FilterGroup>
        <C.FilterGroup>
          <C.FilterLabel>Tipo</C.FilterLabel>
          <C.FilterSelect
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'both' | 'income' | 'expense')}
          >
            <option value="both">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </C.FilterSelect>
        </C.FilterGroup>
        <C.FilterGroup>
          <C.FilterLabel>Categoria</C.FilterLabel>
          <C.FilterSelect
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </C.FilterSelect>
        </C.FilterGroup>
      </C.FiltersBar>

      {/* Cards de resumo */}
      <SummaryCards
        income={summary.income}
        expense={summary.expense}
        balance={summary.balance}
      />

      {/* Gráficos */}
      <ReportsCharts
        monthlyData={monthlyData}
        dailyTrend={dailyTrend}
        categoryData={categoryData}
        incomeCategoryData={incomeCategoryData}
      />

      {/* Tabela de maiores despesas */}
      <TopExpensesTable transactions={filteredByDate} categories={categories} />
    </C.Container>
  );
};

export default ReportsPage;
