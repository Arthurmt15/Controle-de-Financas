/**
 * @file hooks/useTransactions.ts
 * @description Re-exporta o hook useTransactions do TransactionsContext.
 * Utiliza contexto compartilhado para garantir atualização automática
 * entre TransactionForm e TransactionList.
 */

export { useTransactions, useTransactions as default } from '../contexts/TransactionsContext';
