/**
 * @file components/features/Reports/components/TopExpensesTable.tsx
 * @description Tabela com as maiores despesas do período selecionado.
 * Exibe top 10 despesas com descrição, valor, categoria e data.
 */

import React from 'react';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import * as C from './TopExpensesTable.styles';
import type { Transaction, Category } from '../../../../types';

/**
 * Props do componente TopExpensesTable
 */
interface TopExpensesTableProps {
  /** Lista de transações filtradas (apenas despesas) */
  transactions: Transaction[];
  /** Lista de categorias disponíveis */
  categories: Category[];
}

/**
 * Tabela de maiores despesas
 * @param {TopExpensesTableProps} props - Props do componente
 * @returns {JSX.Element} Tabela renderizada
 *
 * @example
 * <TopExpensesTable transactions={expenses} categories={categories} />
 */
const TopExpensesTable: React.FC<TopExpensesTableProps> = ({ transactions, categories }) => {
  /**
   * Obtém o nome da categoria pelo ID
   * @param categoryId - ID da categoria
   * @returns Nome da categoria ou 'Sem categoria'
   */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /**
   * Obtém a cor da categoria pelo ID
   * @param categoryId - ID da categoria
   * @returns Cor hexadecimal da categoria
   */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  // Ordena por valor e pega top 10
  const topExpenses = [...transactions]
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  return (
    <C.TableCard>
      <C.TableTitle>Top 10 Maiores Despesas</C.TableTitle>
      <C.Table>
        <C.Thead>
          <C.Tr>
            <C.Th>Descrição</C.Th>
            <C.Th>Valor</C.Th>
            <C.Th>Categoria</C.Th>
            <C.Th>Data</C.Th>
          </C.Tr>
        </C.Thead>
        <C.Tbody>
          {topExpenses.length === 0 ? (
            <C.EmptyRow>
              <C.EmptyCell colSpan={4}>Nenhuma despesa encontrada</C.EmptyCell>
            </C.EmptyRow>
          ) : (
            topExpenses.map((t) => (
              <C.Tr key={t.id}>
                <C.Td>{t.description}</C.Td>
                <C.Td>
                  <C.ExpenseValue>{formatCurrency(t.amount)}</C.ExpenseValue>
                </C.Td>
                <C.Td>
                  <C.CategoryBadge $color={getCategoryColor(t.categoryId)}>
                    {getCategoryName(t.categoryId)}
                  </C.CategoryBadge>
                </C.Td>
                <C.Td>{formatDate(t.date)}</C.Td>
              </C.Tr>
            ))
          )}
        </C.Tbody>
      </C.Table>
    </C.TableCard>
  );
};

export default TopExpensesTable;
