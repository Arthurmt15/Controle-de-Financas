/**
 * @file src/components/features/OpenFinance/TransactionList/index.tsx
 * @description Componente que exibe a lista de transações de uma conta.
 * Permite filtrar por data e tipo de transação.
 */

import React, { useEffect, useState } from 'react';
import { OpenFinanceTransaction } from '../../../../types/openFinance';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import {
  Container,
  Filters,
  FilterInput,
  TransactionItem,
  TransactionDescription,
  TransactionAmount,
  TransactionDate,
  TransactionCategory,
  EmptyState,
  LoadingContainer,
} from './styles';

/** Props do componente TransactionList */
interface TransactionListProps {
  /** ID da conta para carregar transações */
  accountId: string;
}

/**
 * Formata o valor monetário para exibição.
 * @param amount Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Formata a data para exibição.
 * @param dateString String de data no formato ISO
 * @returns Data formatada (ex: 13/09/2026)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Componente que exibe lista de transações de uma conta.
 */
const TransactionList: React.FC<TransactionListProps> = ({ accountId }) => {
  const { transactions, loading, loadTransactions } = useOpenFinance();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /** Carrega transações quando a conta muda ou filtros são alterados */
  useEffect(() => {
    if (accountId) {
      loadTransactions(accountId, fromDate || undefined, toDate || undefined);
    }
  }, [accountId, fromDate, toDate, loadTransactions]);

  if (loading) {
    return (
      <LoadingContainer>
        <span>Carregando transações...</span>
      </LoadingContainer>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState>
        <p>Nenhuma transação encontrada</p>
      </EmptyState>
    );
  }

  return (
    <Container>
      <Filters>
        <FilterInput>
          <label htmlFor="from-date">De:</label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </FilterInput>
        <FilterInput>
          <label htmlFor="to-date">Até:</label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </FilterInput>
      </Filters>

      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id}>
          <TransactionDescription>
            <span className="description">{transaction.description}</span>
            <TransactionCategory>{transaction.category}</TransactionCategory>
          </TransactionDescription>
          <TransactionAmount isPositive={transaction.amount >= 0}>
            {formatCurrency(transaction.amount)}
          </TransactionAmount>
          <TransactionDate>{formatDate(transaction.date)}</TransactionDate>
        </TransactionItem>
      ))}
    </Container>
  );
};

export default TransactionList;
