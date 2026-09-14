/**
 * @file components/features/FutureExpenses/List/index.tsx
 * @description Lista de despesas futuras com status e ações.
 * Mostra despesas pendentes, pagas e canceladas.
 */

import React, { useState } from 'react';
import { useFutureExpenses } from '../../../../contexts/FutureExpensesContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import Modal from '../../../common/Modal';
import Icon from '../../../common/Icon';
import FutureExpenseForm from '../Form';
import * as C from './styles';
import type { FutureExpense } from '../../../../types';

/** Lista de despesas futuras */
const FutureExpenseList: React.FC = () => {
  const {
    futureExpenses,
    isLoading,
    deleteFutureExpense,
    markAsPaid,
  } = useFutureExpenses();
  const { categories } = useTransactions();

  const [editingExpense, setEditingExpense] = useState<FutureExpense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'cancelled'>('pending');

  /** Obtém nome da categoria pelo ID */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /** Obtém cor da categoria pelo ID */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  /** Filtra despesas pela aba ativa */
  const filteredExpenses = futureExpenses.filter((e) => e.status === activeTab);

  /** Calcula total por status */
  const totalPending = futureExpenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPaid = futureExpenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  /** Confirma exclusão */
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteFutureExpense(deletingId);
      setDeletingId(null);
    }
  };

  /** Marca como paga */
  const handleMarkAsPaid = async (id: string) => {
    try {
      await markAsPaid(id);
    } catch (error) {
      console.error('Erro ao marcar como paga:', error);
    }
  };

  if (isLoading) {
    return <C.LoadingContainer>Carregando despesas futuras...</C.LoadingContainer>;
  }

  return (
    <C.Container>
      <C.Header>
        <C.Title>Despesas Futuras</C.Title>
        <C.Summary>
          <C.SummaryItem>
            <span>Pendente:</span>
            <strong>{formatCurrency(totalPending)}</strong>
          </C.SummaryItem>
          <C.SummaryItem>
            <span>Pago:</span>
            <strong>{formatCurrency(totalPaid)}</strong>
          </C.SummaryItem>
        </C.Summary>
      </C.Header>

      <C.Tabs>
        <C.Tab
          $isActive={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
        >
          Pendentes ({futureExpenses.filter((e) => e.status === 'pending').length})
        </C.Tab>
        <C.Tab
          $isActive={activeTab === 'paid'}
          onClick={() => setActiveTab('paid')}
        >
          Pagas ({futureExpenses.filter((e) => e.status === 'paid').length})
        </C.Tab>
        <C.Tab
          $isActive={activeTab === 'cancelled'}
          onClick={() => setActiveTab('cancelled')}
        >
          Canceladas ({futureExpenses.filter((e) => e.status === 'cancelled').length})
        </C.Tab>
      </C.Tabs>

      {filteredExpenses.length === 0 ? (
        <C.EmptyState>
          <p>Nenhuma despesa {activeTab === 'pending' ? 'pendente' : activeTab === 'paid' ? 'paga' : 'cancelada'}</p>
        </C.EmptyState>
      ) : (
        <C.List>
          {filteredExpenses.map((expense) => {
            const daysUntil = Math.ceil(
              (new Date(expense.expectedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isUrgent = daysUntil <= 7 && daysUntil >= 0;

            return (
              <C.ListItem key={expense.id} $isUrgent={isUrgent}>
                <C.ItemInfo>
                  <C.ItemDescription>
                    <C.TypeIndicator $type="expense" />
                    <span>{expense.description}</span>
                  </C.ItemDescription>
                  <C.ItemDetails>
                    <C.CategoryBadge $color={getCategoryColor(expense.categoryId)}>
                      {getCategoryName(expense.categoryId)}
                    </C.CategoryBadge>
                    <C.ItemDate>{formatDate(expense.expectedDate)}</C.ItemDate>
                    {activeTab === 'pending' && (
                      <C.DaysUntil $isUrgent={isUrgent}>
                        {daysUntil <= 0
                          ? 'Vencido'
                          : daysUntil === 1
                          ? 'Amanhã'
                          : `Em ${daysUntil} dias`}
                      </C.DaysUntil>
                    )}
                  </C.ItemDetails>
                </C.ItemInfo>

                <C.ItemAmount>{formatCurrency(expense.amount)}</C.ItemAmount>

                <C.ItemActions>
                  {activeTab === 'pending' && (
                    <C.ActionButton
                      onClick={() => handleMarkAsPaid(expense.id)}
                      title="Marcar como paga"
                    >
                      <Icon size={14}>
                        <polyline points="20 6 9 17 4 12" />
                      </Icon>
                    </C.ActionButton>
                  )}
                  <C.ActionButton
                    onClick={() => setEditingExpense(expense)}
                    title="Editar"
                  >
                    <Icon size={14}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </Icon>
                  </C.ActionButton>
                  <C.ActionButton
                    $variant="danger"
                    onClick={() => setDeletingId(expense.id)}
                    title="Excluir"
                  >
                    <Icon size={14} color="#ef4444">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </Icon>
                  </C.ActionButton>
                </C.ItemActions>
              </C.ListItem>
            );
          })}
        </C.List>
      )}

      {/* Modal de edição */}
      <Modal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title="Editar Despesa Futura"
        size="lg"
      >
        <FutureExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirmar Exclusão"
        size="sm"
        closeOnOverlayClick={false}
      >
        <C.DeleteConfirmation>
          <p>Tem certeza que deseja excluir esta despesa futura?</p>
          <p>Esta ação não pode ser desfeita.</p>
          <C.DeleteActions>
            <C.DeleteButton onClick={() => setDeletingId(null)} $variant="ghost">
              Cancelar
            </C.DeleteButton>
            <C.DeleteButton onClick={handleConfirmDelete} $variant="danger">
              Excluir
            </C.DeleteButton>
          </C.DeleteActions>
        </C.DeleteConfirmation>
      </Modal>
    </C.Container>
  );
};

export default FutureExpenseList;
