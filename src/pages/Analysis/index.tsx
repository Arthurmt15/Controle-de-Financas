import React, { useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../utils/formatters';
import { filterByCurrentMonth, filterByCurrentYear } from '../../utils/transactionFilters';
import MonthlyComparison from '../../components/features/Analysis/components/MonthlyComparison';
import SpendingInsights from '../../components/features/Analysis/components/SpendingInsights';
import CategoryBreakdown from '../../components/features/Analysis/components/CategoryBreakdown';
import MonthlyChart from '../../components/features/Analysis/components/MonthlyChart';
import FinancialAdvisor from '../../components/features/FinancialAdvisor';
import * as C from './styles';

const AnalysisPage: React.FC = () => {
  const { transactions, categories } = useTransactions();

  const metrics = useMemo(() => {
    const monthly = filterByCurrentMonth(transactions);
    const yearly = filterByCurrentYear(transactions);

    const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const yearlyIncome = yearly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const yearlyExpense = yearly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      yearlyBalance: yearlyIncome - yearlyExpense,
    };
  }, [transactions]);

  return (
    <C.Container>
      <C.Header>
        <div>
          <C.Title>Análise</C.Title>
          <C.Subtitle>Como estão suas finanças e como melhorar</C.Subtitle>
        </div>
      </C.Header>

      <C.ContentLayout>
        <C.ChartsColumn>
          <C.SummaryGrid>
            <C.SummaryCard $variant="income">
              <C.SummaryLabel>Entradas do Mês</C.SummaryLabel>
              <C.SummaryValue>{formatCurrency(metrics.monthlyIncome)}</C.SummaryValue>
            </C.SummaryCard>
            <C.SummaryCard $variant="expense">
              <C.SummaryLabel>Saídas do Mês</C.SummaryLabel>
              <C.SummaryValue>{formatCurrency(metrics.monthlyExpense)}</C.SummaryValue>
            </C.SummaryCard>
            <C.SummaryCard $variant="balance">
              <C.SummaryLabel>Saldo do Mês</C.SummaryLabel>
              <C.SummaryValue>{formatCurrency(metrics.monthlyBalance)}</C.SummaryValue>
              <C.SummarySubtext $positive={metrics.monthlyBalance >= 0}>
                {metrics.monthlyBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
              </C.SummarySubtext>
            </C.SummaryCard>
            <C.SummaryCard $variant="annual">
              <C.SummaryLabel>Saldo Anual</C.SummaryLabel>
              <C.SummaryValue>{formatCurrency(metrics.yearlyBalance)}</C.SummaryValue>
              <C.SummarySubtext $positive={metrics.yearlyBalance >= 0}>
                Ano {new Date().getFullYear()}
              </C.SummarySubtext>
            </C.SummaryCard>
          </C.SummaryGrid>

          <C.Section>
            <C.SectionTitle>Evolução Mensal</C.SectionTitle>
            <C.SectionDescription>Últimos 12 meses de entradas vs saídas</C.SectionDescription>
            <MonthlyChart transactions={transactions} />
          </C.Section>

          <C.TwoColumns>
            <MonthlyComparison transactions={transactions} />
            <CategoryBreakdown transactions={transactions} categories={categories} />
          </C.TwoColumns>

          <SpendingInsights transactions={transactions} categories={categories} />
        </C.ChartsColumn>

        <C.ChatColumn>
          <FinancialAdvisor />
        </C.ChatColumn>
      </C.ContentLayout>
    </C.Container>
  );
};

export default AnalysisPage;
