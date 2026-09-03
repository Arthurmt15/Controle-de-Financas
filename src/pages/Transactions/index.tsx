/**
 * @file pages/Transactions/index.tsx
 * @description Página de gerenciamento de transações.
 * Formulário para adicionar e lista de transações.
 */

import React from 'react';
import TransactionForm from '../../components/features/TransactionForm';
import TransactionList from '../../components/features/TransactionList';
import * as C from './styles';

/**
 * Página de Transações
 * @returns {JSX.Element} Página renderizada
 *
 * @example
 * <TransactionsPage />
 */
const TransactionsPage: React.FC = () => {
  return (
    <C.Container>
      <C.FormSection>
        <TransactionForm />
      </C.FormSection>
      <C.ListSection>
        <TransactionList />
      </C.ListSection>
    </C.Container>
  );
};

export default TransactionsPage;
