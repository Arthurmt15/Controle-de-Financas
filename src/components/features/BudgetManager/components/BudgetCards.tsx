/**
 * @file components/features/BudgetManager/components/BudgetCards.tsx
 * @description Cards individuais de orçamento por categoria.
 * Exibe progresso, valor gasto e restante para cada categoria.
 */

import React from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import Icon from '../../../common/Icon';
import * as C from './BudgetCards.styles';
import type { Budget, Category } from '../../../../types';

/**
 * Props do componente BudgetCards
 */
interface BudgetCardsProps {
  /** Lista de orçamentos do mês */
  budgets: Budget[];
  /** Gastos por categoria {categoryId: valor} */
  categorySpending: Record<string, number>;
  /** Lista de categorias */
  categories: Category[];
  /** Função para excluir orçamento */
  onDelete: (id: string) => void;
}

/**
 * Calcula a porcentagem de uso
 * @param limit - Limite da categoria
 * @param spent - Valor gasto
 * @returns Porcentagem (0-100)
 */
const getPercentage = (limit: number, spent: number): number => {
  if (limit === 0) return 0;
  return Math.min((spent / limit) * 100, 100);
};

/**
 * Retorna a cor baseada na porcentagem
 * @param percentage - Porcentagem de uso
 * @returns Cor hexadecimal
 */
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#10b981';
};

/**
 * Cards de orçamento por categoria
 * @param {BudgetCardsProps} props - Props do componente
 * @returns {JSX.Element} Cards renderizados
 *
 * @example
 * <BudgetCards budgets={budgets} spending={spending} categories={categories} onDelete={handleDelete} />
 */
const BudgetCards: React.FC<BudgetCardsProps> = ({
  budgets,
  categorySpending,
  categories,
  onDelete,
}) => {
  /**
   * Obtém o nome da categoria pelo ID
   * @param categoryId - ID da categoria
   * @returns Nome da categoria
   */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /**
   * Obtém a cor da categoria pelo ID
   * @param categoryId - ID da categoria
   * @returns Cor hexadecimal
   */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  if (budgets.length === 0) {
    return (
      <C.EmptyState>
        <C.EmptyIcon>
          <Icon size={48}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 10h20" />
          </Icon>
        </C.EmptyIcon>
        <C.EmptyText>Nenhum orçamento definido para este mês</C.EmptyText>
        <C.EmptyHint>Clique em "Novo Orçamento" para começar</C.EmptyHint>
      </C.EmptyState>
    );
  }

  return (
    <C.BudgetGrid>
      {budgets.map((budget) => {
        const spent = categorySpending[budget.categoryId] || 0;
        const percentage = getPercentage(budget.limit, spent);
        const color = getPercentageColor(percentage);
        const remaining = budget.limit - spent;

        return (
          <C.BudgetCard key={budget.id}>
            {/* Cabeçalho com categoria e botão excluir */}
            <C.CardHeader>
              <C.CardCategory>
                <C.CategoryDot $color={getCategoryColor(budget.categoryId)} />
                <C.CategoryName>{getCategoryName(budget.categoryId)}</C.CategoryName>
              </C.CardCategory>
              <C.DeleteButton
                onClick={() => onDelete(budget.id)}
                aria-label="Excluir orçamento"
              >
                <Icon size={14}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </Icon>
              </C.DeleteButton>
            </C.CardHeader>

            {/* Barra de progresso */}
            <C.CardProgress>
              <C.ProgressHeader>
                <C.ProgressSpent>{formatCurrency(spent)}</C.ProgressSpent>
                <C.ProgressLimit>de {formatCurrency(budget.limit)}</C.ProgressLimit>
              </C.ProgressHeader>
              <C.ProgressTrack>
                <C.ProgressFillLarge $percentage={percentage} $color={color} />
              </C.ProgressTrack>
            </C.CardProgress>

            {/* Rodapé com restante e porcentagem */}
            <C.CardFooter>
              <C.FooterItem>
                <C.FooterLabel>Restante</C.FooterLabel>
                <C.FooterValue $type={remaining >= 0 ? 'income' : 'expense'}>
                  {formatCurrency(remaining)}
                </C.FooterValue>
              </C.FooterItem>
              <C.FooterItem>
                <C.FooterLabel>Utilizado</C.FooterLabel>
                <C.FooterPercentage $color={color}>{percentage.toFixed(0)}%</C.FooterPercentage>
              </C.FooterItem>
            </C.CardFooter>
          </C.BudgetCard>
        );
      })}
    </C.BudgetGrid>
  );
};

export default BudgetCards;
