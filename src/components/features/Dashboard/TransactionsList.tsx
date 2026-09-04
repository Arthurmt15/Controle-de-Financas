/**
 * @file components/features/Dashboard/TransactionsList.tsx
 * @description Componente de lista de transações recentes do Dashboard.
 * Exibe as últimas 5 transações registradas.
 */

import React, { useMemo } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency } from '../../../utils/formatters';
import * as C from './styles';

/**
 * Componente TransactionsList
 * Exibe as transações mais recentes do usuário
 */
const TransactionsList: React.FC = () => {
  const { transactions } = useTransactions();

  /**
   * Obtém as 5 transações mais recentes
   * Retorna array ordenado por data decrescente
   */
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  /**
   * Formata a data para exibição
   * @param {string} dateString - Data em formato ISO
   * @returns {string} Data formatada (DD/MM/AAAA)
   */
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
          <C.TransactionIcon style={{ background: 'rgba(112, 72, 237, 0.13)', color: '#9d73ff' }}>
            💳
          </C.TransactionIcon>
          <strong style={{ fontSize: '13px' }}>Nenhuma transação</strong>
          <span style={{ color: '#8995a9', fontSize: '12px' }}>
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
          <TransactionRow key={tx.id} tx={tx} formatDate={formatDate} />
        ))}
      </div>
    </C.Transactions>
  );
};

/** Props da linha de transação */
interface TransactionRowProps {
  /** Dados da transação */
  tx: { id: string; description: string; amount: number; type: 'income' | 'expense'; date: string };
  /** Função de formatação de data */
  formatDate: (date: string) => string;
}

/**
 * Componente de linha de transação
 * Exibe uma transação individual com ícone, descrição e valor
 */
const TransactionRow: React.FC<TransactionRowProps> = ({ tx, formatDate }) => {
  const isIncome = tx.type === 'income';
  const color = isIncome ? '#00c98b' : '#ff4d55';
  const bgColor = isIncome ? 'rgba(0, 201, 139, 0.17)' : 'rgba(255, 77, 85, 0.17)';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #202b3f',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <C.TransactionIcon style={{ background: bgColor, color }}>
          {isIncome ? '↗' : '↘'}
        </C.TransactionIcon>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{tx.description}</div>
          <div style={{ fontSize: '11px', color: '#8d99ad' }}>{formatDate(tx.date)}</div>
        </div>
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color }}>
        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
      </span>
    </div>
  );
};

export default TransactionsList;
