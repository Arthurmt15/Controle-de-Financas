/**
 * @file components/features/TransactionList/index.tsx
 * @description Lista de transações com filtros, ordenação e ações.
 * Exibe transações em formato de tabela com opções de editar e excluir.
 */

import React, { useState } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { exportTransactionsCSV, exportTransactionsPDF } from '../../../utils/exportData';
import Modal from '../../common/Modal';
import TransactionForm from '../TransactionForm';
import * as C from './styles';
import type { Transaction } from '../../../types';

/**
 * Componente TransactionList
 * @returns {JSX.Element} Lista de transações renderizada
 *
 * @example
 * <TransactionList />
 */
const TransactionList: React.FC = () => {
  const {
    filteredTransactions,
    categories,
    filters,
    setFilters,
    deleteTransaction,
  } = useTransactions();

  // Estado para edição
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Estado para confirmação de exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Obtém o nome da categoria pelo ID
   */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /**
   * Obtém a cor da categoria pelo ID
   */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  /**
   * Abre o modal de edição
   */
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  /**
   * Confirma e executa a exclusão
   */
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <C.Container>
      {/* Cabeçalho com filtros */}
      <C.Header>
        <C.Title>Transações</C.Title>

        {/* Botões de exportação */}
        <C.ExportButtons>
          <C.ExportButton
            onClick={() => exportTransactionsCSV({ transactions: filteredTransactions, categories })}
            aria-label="Exportar como CSV"
            title="Exportar CSV"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            CSV
          </C.ExportButton>
          <C.ExportButton
            onClick={() => exportTransactionsPDF({ transactions: filteredTransactions, categories })}
            aria-label="Exportar como PDF"
            title="Exportar PDF"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            PDF
          </C.ExportButton>
        </C.ExportButtons>

        {/* Filtros */}
        <C.Filters>
          <C.SearchInput
            type="text"
            placeholder="Buscar transações..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ searchTerm: e.target.value })}
            aria-label="Buscar transações"
          />

          <C.FilterSelect
            value={filters.type}
            onChange={(e) =>
              setFilters({ type: e.target.value as 'income' | 'expense' | 'both' })
            }
            aria-label="Filtrar por tipo"
          >
            <option value="both">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </C.FilterSelect>

          <C.FilterSelect
            value={filters.categoryId || ''}
            onChange={(e) => setFilters({ categoryId: e.target.value || null })}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </C.FilterSelect>
        </C.Filters>
      </C.Header>

      {/* Tabela de transações */}
      <C.TableWrapper>
        <C.Table>
          <C.Thead>
            <C.Tr>
              <C.Th>Descrição</C.Th>
              <C.Th>Valor</C.Th>
              <C.Th>Categoria</C.Th>
              <C.Th>Data</C.Th>
              <C.Th>Ações</C.Th>
            </C.Tr>
          </C.Thead>
          <C.Tbody>
            {filteredTransactions.length === 0 ? (
              <C.EmptyRow>
                <C.EmptyCell colSpan={5}>
                  Nenhuma transação encontrada
                </C.EmptyCell>
              </C.EmptyRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <C.Tr key={transaction.id}>
                  <C.Td>
                    <C.Description>
                      <C.TypeIndicator $type={transaction.type} />
                      <span>{transaction.description}</span>
                    </C.Description>
                  </C.Td>
                  <C.Td>
                    <C.Amount $type={transaction.type}>
                      {transaction.type === 'expense' ? '-' : '+'}{' '}
                      {formatCurrency(transaction.amount)}
                    </C.Amount>
                  </C.Td>
                  <C.Td>
                    <C.CategoryBadge $color={getCategoryColor(transaction.categoryId)}>
                      {getCategoryName(transaction.categoryId)}
                    </C.CategoryBadge>
                  </C.Td>
                  <C.Td>{formatDate(transaction.date)}</C.Td>
                  <C.Td>
                    <C.Actions>
                      <C.ActionButton
                        onClick={() => handleEdit(transaction)}
                        aria-label={`Editar ${transaction.description}`}
                        title="Editar"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </C.ActionButton>
                      <C.ActionButton
                        $variant="danger"
                        onClick={() => setDeletingId(transaction.id)}
                        aria-label={`Excluir ${transaction.description}`}
                        title="Excluir"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </C.ActionButton>
                    </C.Actions>
                  </C.Td>
                </C.Tr>
              ))
            )}
          </C.Tbody>
        </C.Table>
      </C.TableWrapper>

      {/* Modal de edição */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Editar Transação"
        size="lg"
      >
        <TransactionForm
          editingTransaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
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
          <p>Tem certeza que deseja excluir esta transação?</p>
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

export default TransactionList;
