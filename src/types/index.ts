/**
 * @file types/index.ts
 * @description Definições de tipos TypeScript para o sistema de controle financeiro.
 * Este arquivo exporta todas as interfaces e tipos utilizados no projeto.
 */

/**
 * Interface que representa uma transação financeira
 * @interface Transaction
 */
export interface Transaction {
  /** Identificador único da transação */
  id: string;
  /** Descrição da transação */
  description: string;
  /** Valor da transação (positivo para entrada, negativo para saída) */
  amount: number;
  /** Tipo da transação: 'income' para entrada, 'expense' para saída */
  type: 'income' | 'expense';
  /** Data da transação no formato ISO */
  date: string;
  /** ID da categoria associada */
  categoryId: string;
  /** Observações adicionais (opcional) */
  notes?: string;
}

/**
 * Interface que representa uma categoria de transação
 * @interface Category
 */
export interface Category {
  /** Identificador único da categoria */
  id: string;
  /** Nome da categoria */
  name: string;
  /** Cor da categoria em hexadecimal */
  color: string;
  /** Ícone da categoria (nome do ícone do react-icons) */
  icon: string;
  /** Tipo padrão da categoria: 'income', 'expense' ou 'both' */
  defaultType: 'income' | 'expense' | 'both';
}

/**
 * Interface que representa o estado do usuário autenticado
 * @interface User
 */
export interface User {
  /** Identificador único do usuário */
  id: string;
  /** Nome completo do usuário */
  name: string;
  /** Email do usuário */
  email: string;
  /** URL da foto do perfil (opcional) */
  avatar?: string;
}

/**
 * Interface que representa as credenciais de login
 * @interface LoginCredentials
 */
export interface LoginCredentials {
  /** Email do usuário */
  email: string;
  /** Senha do usuário */
  password: string;
}

/**
 * Interface que representa o estado de autenticação
 * @interface AuthState
 */
export interface AuthState {
  /** Indica se o usuário está autenticado */
  isAuthenticated: boolean;
  /** Dados do usuário autenticado (null se não autenticado) */
  user: User | null;
  /** Indica se está carregando */
  isLoading: boolean;
  /** Mensagem de erro (se houver) */
  error: string | null;
}

/**
 * Interface que representa o estado global das transações
 * @interface TransactionState
 */
export interface TransactionState {
  /** Lista de todas as transações */
  transactions: Transaction[];
  /** Lista de categorias disponíveis */
  categories: Category[];
  /** Filtros aplicados */
  filters: TransactionFilters;
  /** Indica se está carregando */
  isLoading: boolean;
  /** Mensagem de erro (se houver) */
  error: string | null;
}

/**
 * Interface que representa os filtros de transação
 * @interface TransactionFilters
 */
export interface TransactionFilters {
  /** Data de início do período */
  startDate: string | null;
  /** Data de fim do período */
  endDate: string | null;
  /** Tipo de transação (income/expense/both) */
  type: 'income' | 'expense' | 'both';
  /** ID da categoria (null para todas) */
  categoryId: string | null;
  /** Termo de busca na descrição */
  searchTerm: string;
  /** Campo de ordenação */
  sortBy: 'date' | 'amount' | 'description';
  /** Direção da ordenação */
  sortOrder: 'asc' | 'desc';
}

/**
 * Interface que representa as ações do reducer de transações
 * @interface TransactionAction
 */
export type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TransactionFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/**
 * Interface que representa as ações do reducer de autenticação
 * @interface AuthAction
 */
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

/**
 * Interface que representa as props comuns de um componente
 * @interface CommonProps
 */
export interface CommonProps {
  /** Classes CSS adicionais */
  className?: string;
  /** ID do elemento */
  id?: string;
  /** Estilo inline */
  style?: React.CSSProperties;
}

/**
 * Interface que representa as props de um botão
 * @interface ButtonProps
 */
export interface ButtonProps extends CommonProps {
  /** Texto do botão */
  children: React.ReactNode;
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Indica se o botão está desabilitado */
  disabled?: boolean;
  /** Indica se o botão está carregando */
  isLoading?: boolean;
  /** Ícone à esquerda do texto */
  leftIcon?: React.ReactNode;
  /** Ícone à direita do texto */
  rightIcon?: React.ReactNode;
  /** Função chamada ao clicar no botão */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Tipo do botão HTML */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Interface que representa as props de um input
 * @interface InputProps
 */
export interface InputProps extends CommonProps {
  /** Valor do input */
  value: string;
  /** Função chamada ao alterar o valor */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label do input */
  label?: string;
  /** Placeholder do input */
  placeholder?: string;
  /** Tipo do input */
  type?: 'text' | 'number' | 'email' | 'password' | 'date';
  /** Indica se o input está desabilitado */
  disabled?: boolean;
  /** Indica se o input é obrigatório */
  required?: boolean;
  /** Mensagem de erro */
  error?: string;
  /** Texto de ajuda */
  helperText?: string;
  /** Nome do input (para formulários) */
  name?: string;
  /** ID do input */
  inputId?: string;
}

/**
 * Interface que representa as props de um modal
 * @interface ModalProps
 */
export interface ModalProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Função chamada ao fechar o modal */
  onClose: () => void;
  /** Título do modal */
  title: string;
  /** Conteúdo do modal */
  children: React.ReactNode;
  /** Tamanho do modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Indica se pode fechar clicando fora */
  closeOnOverlayClick?: boolean;
}

// Re-exporta tipos de dashboard e gráficos
export type {
  DashboardMetrics,
  ChartDataItem,
  MonthlyChartData,
  Budget,
  BudgetState,
  BudgetAction,
} from './dashboard';
