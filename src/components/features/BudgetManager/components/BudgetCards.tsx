/**
 * @file components/features/BudgetManager/components/BudgetCards.tsx
 * @description Cards de orçamento por categoria com shadcn + tailwind + framer-motion + lucide.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import type { Budget, Category } from '../../../../types';

/** Props dos cards */
interface BudgetCardsProps {
  budgets: Budget[];
  categorySpending: Record<string, number>;
  categories: Category[];
  onDelete: (id: string) => void;
}

/** Porcentagem 0-100 */
const getPercentage = (limit: number, spent: number): number => {
  if (limit === 0) return 0;
  return Math.min((spent / limit) * 100, 100);
};

/** Cor via porcentagem */
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#10b981';
};

/** Cards de orçamento — shadcn */
const BudgetCards: React.FC<BudgetCardsProps> = ({ budgets, categorySpending, categories, onDelete }) => {
  const getCategoryName = (categoryId: string): string => categories.find((c) => c.id === categoryId)?.name || 'Sem categoria';
  const getCategoryColor = (categoryId: string): string => categories.find((c) => c.id === categoryId)?.color || '#6b7280';

  // Estado vazio
  if (budgets.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-10 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Wallet className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold">Nenhum orçamento definido para este mês</p>
          <p className="mt-1 text-xs text-muted-foreground">Clique em “Novo orçamento” para começar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {budgets.map((budget, idx) => {
        const spent = categorySpending[budget.categoryId] || 0;
        const percentage = getPercentage(budget.limit, spent);
        const color = getPercentageColor(percentage);
        const remaining = budget.limit - spent;
        const isOver = remaining < 0;

        return (
          <motion.div
            key={budget.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
          >
            <Card className="rounded-2xl overflow-hidden relative hover:shadow-md transition-shadow">
              {/* Faixa superior com cor da porcentagem */}
              <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />
              <CardContent className="p-4 space-y-3">
                {/* Cabeçalho: categoria + excluir */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getCategoryColor(budget.categoryId) }} />
                    <span className="text-[13.5px] font-semibold truncate">{getCategoryName(budget.categoryId)}</span>
                    {isOver && (
                      <Badge variant="destructive" className="rounded-full text-[10px] px-1.5 py-0">
                        estourado
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                    onClick={() => onDelete(budget.id)}
                    aria-label="Excluir orçamento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Progresso: gasto / limite */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[18px] font-bold tracking-tight leading-none">{formatCurrency(spent)}</span>
                    <span className="text-xs text-muted-foreground">de {formatCurrency(budget.limit)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>

                {/* Rodapé: restante e porcentagem */}
                <div className="flex justify-between pt-3 border-t gap-4">
                  <div className="space-y-1">
                    <span className="block text-[11px] tracking-widest uppercase font-semibold text-muted-foreground">Restante</span>
                    <span className={`text-[13px] font-bold flex items-center gap-1 ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isOver ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="block text-[11px] tracking-widest uppercase font-semibold text-muted-foreground">Utilizado</span>
                    <Badge className="rounded-full text-xs font-semibold border-0" style={{ background: color, color: 'white' }}>
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BudgetCards;
