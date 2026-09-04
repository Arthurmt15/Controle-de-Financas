/**
 * @file types/dashboard.ts
 * @description Definições de tipos para dashboard, gráficos e orçamentos.
 */

/**
 * Interface que representa as métricas do dashboard
 * @interface DashboardMetrics
 */
export interface DashboardMetrics {
  /** Total de entradas no mês */
  monthlyIncome: number;
  /** Total de saídas no mês */
  monthlyExpense: number;
  /** Saldo do mês */
  monthlyBalance: number;
  /** Total de entradas no ano */
  yearlyIncome: number;
  /** Total de saídas no ano */
  yearlyExpense: number;
  /** Saldo do ano */
  yearlyBalance: number;
  /** Média de entradas mensais */
  averageMonthlyIncome: number;
  /** Média de saídas mensais */
  averageMonthlyExpense: number;
}

/**
 * Interface que representa um item de gráfico
 * @interface ChartDataItem
 */
export interface ChartDataItem {
  /** Nome/label do item */
  name: string;
  /** Valor numérico */
  value: number;
  /** Cor de preenchimento (opcional) */
  fill?: string;
}

/**
 * Interface que representa dados para gráfico de barras mensal
 * @interface MonthlyChartData
 */
export interface MonthlyChartData {
  /** Mês (abreviação) */
  month: string;
  /** Valor de entradas */
  income: number;
  /** Valor de saídas */
  expense: number;
}

/**
 * Interface que representa um orçamento mensal por categoria
 * @interface Budget
 */
export interface Budget {
  /** Identificador único do orçamento */
  id: string;
  /** ID da categoria */
  categoryId: string;
  /** Limite mensal para esta categoria */
  limit: number;
  /** Mês do orçamento (formato YYYY-MM) */
  month: string;
}

/**
 * Interface que representa o estado dos orçamentos
 * @interface BudgetState
 */
export interface BudgetState {
  /** Lista de orçamentos */
  budgets: Budget[];
  /** Mensagem de erro (se houver) */
  error: string | null;
}

/**
 * Interface que representa as ações do reducer de orçamentos
 * @interface BudgetAction
 */
export type BudgetAction =
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_BUDGET_ERROR'; payload: string | null };
