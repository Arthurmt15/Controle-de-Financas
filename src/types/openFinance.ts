/**
 * @file src/types/openFinance.ts
 * @description Definições de tipos TypeScript para dados do Open Finance Brasil.
 * Estes tipos representam contas e transações obtidas via Pluggy API.
 */

/**
 * Interface que representa uma conta financeira conectada.
 * Exibe informações como banco, agência, conta e saldo.
 */
export interface OpenFinanceAccount {
  /** ID único da conta na Pluggy */
  id: string;
  /** ID do item (conexão) ao qual a conta pertence */
  itemId: string;
  /** Tipo da conta (CHECKING, SAVINGS, CREDIT_CARD, etc.) */
  type: string;
  /** Nome da instituição financeira */
  name: string;
  /** Código do banco */
  bankCode: string;
  /** Número da agência */
  branch: string;
  /** Número da conta */
  number: string;
  /** Saldo atual da conta */
  balance: number;
  /** Moeda da conta */
  currencyCode: string;
  /** Data de criação na Pluggy */
  createdAt: string;
  /** Data da última atualização */
  updatedAt: string;
}

/**
 * Interface que representa uma transação financeira.
 * Contém detalhes como valor, descrição e data.
 */
export interface OpenFinanceTransaction {
  /** ID único da transação */
  id: string;
  /** ID da conta à qual a transação pertence */
  accountId: string;
  /** Descrição da transação */
  description: string;
  /** Valor da transação (positivo=entrada, negativo=saida) */
  amount: number;
  /** Data da transação no formato ISO */
  date: string;
  /** Categoria da transação */
  category: string;
  /** Tipo da transação */
  type: string;
  /** Status da transação */
  status: string;
  /** Data de criação na Pluggy */
  createdAt: string;
}

/**
 * Interface que representa um item (conexão) com uma instituição.
 */
export interface OpenFinanceItem {
  /** ID único do registro local */
  id: string;
  /** ID do usuário no sistema */
  user_id: string;
  /** ID do item na Pluggy */
  pluggy_item_id: string;
  /** ID do conector (instituição) */
  connector_id: number;
  /** Nome da instituição financeira */
  institution_name: string;
  /** Status atual do item */
  status: string;
  /** Data de criação */
  created_at: string;
  /** Data da última atualização */
  updated_at: string;
}

/**
 * Interface para o token de conexão do widget.
 */
export interface ConnectToken {
  /** Token de acesso */
  accessToken: string;
  /** Data de expiração */
  expiresAt: string;
}

/**
 * Interface para estado do contexto Open Finance.
 */
export interface OpenFinanceState {
  /** Lista de contas conectadas */
  accounts: OpenFinanceAccount[];
  /** Lista de transações */
  transactions: OpenFinanceTransaction[];
  /** Lista de itens conectados */
  items: OpenFinanceItem[];
  /** Indica se está carregando dados */
  loading: boolean;
  /** Mensagem de erro (se houver) */
  error: string | null;
  /** Conta selecionada para ver transações */
  selectedAccountId: string | null;
}

/**
 * Tipo para ações do reducer do Open Finance.
 */
export type OpenFinanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACCOUNTS'; payload: OpenFinanceAccount[] }
  | { type: 'SET_TRANSACTIONS'; payload: OpenFinanceTransaction[] }
  | { type: 'SET_ITEMS'; payload: OpenFinanceItem[] }
  | { type: 'ADD_ITEM'; payload: OpenFinanceItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SELECT_ACCOUNT'; payload: string | null }
  | { type: 'CLEAR_DATA' };
