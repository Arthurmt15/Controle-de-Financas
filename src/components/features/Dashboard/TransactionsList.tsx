/**
 * @file components/features/Dashboard/TransactionsList.tsx
 * @description Componente de lista de transações recentes do Dashboard.
 * Exibe as últimas 5 transações registradas.
 */

import React, { useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency } from '../../../utils/formatters';
import * as C from './styles';

/**
 * Componente TransactionsList
 * Exibe as transações mais recentes do usuário
 */
const TransactionsList: React.FC = () => {
  const { transactions } = useTransactions();
  const { theme } = useTheme();

  /** Transações mais recentes (últimas 5) */
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  /** Formata data ISO para DD/MM/AAAA */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (recentTransactions.length === 0) {
    return (
      <C.Transactions>
        <C.TransactionsHeader>
          <h2>Últimas Transações</h2>
        </C.TransactionsHeader>
        <C.TransactionsEmpty>
          <C.TransactionIcon style={{ background: `${theme.colors.primary}20`, color: theme.colors.primary }}>
            💳
          </C.TransactionIcon>
          <strong style={{ fontSize: '13px' }}>Nenhuma transação</strong>
          <span style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
            Adicione sua primeira transação
          </span>
        </C.TransactionsEmpty>
      </C.Transactions>
    );
  }

  return (
    <C.Transactions>
      <C.TransactionsHeader>
        <h2>Últimas Transações</h2>
      </C.TransactionsHeader>
      <div style={{ padding: '0 21px' }}>
        {recentTransactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} formatDate={formatDate} theme={theme} />
        ))}
      </div>
    </C.Transactions>
  );
};

/** Props da linha de transação */
interface TransactionRowProps {
  tx: { id: string; description: string; amount: number; type: 'income' | 'expense'; date: string };
  formatDate: (date: string) => string;
  theme: { colors: { success: string; error: string; border: string; textSecondary: string } };
}

/**
 * Componente de linha de transação individual
 */
const TransactionRow: React.FC<TransactionRowProps> = ({ tx, formatDate, theme }) => {
  const isIncome = tx.type === 'income';
  const color = isIncome ? theme.colors.success : theme.colors.error;
  const bgColor = isIncome ? `${theme.colors.success}28` : `${theme.colors.error}28`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.colors.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <C.TransactionIcon style={{ background: bgColor, color }}>
          {isIncome ? '↗' : '↘'}
        </C.TransactionIcon>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{tx.description}</div>
          <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>{formatDate(tx.date)}</div>
        </div>
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color }}>
        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
      </span>
    </div>
  );
};

export default TransactionsList;