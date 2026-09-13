/**
 * @file server/src/types/pluggy.ts
 * @description Definições de tipos TypeScript para integração com a Pluggy API.
 * Estes tipos representam os dados retornados pela API do Open Finance Brasil.
 */

/**
 * Interface que representa uma conta financeira conectada via Pluggy.
 * Contém informações básicas como banco, agência, conta e saldo.
 */
export interface PluggyAccount {
  /** ID único da conta na Pluggy */
  id: string;
  /** ID do item (conexão) ao qual a conta pertence */
  itemId: string;
  /** Tipo da conta (CHECKING, SAVINGS, CREDIT_CARD, etc.) */
  type: string;
  /** Nome da instituição financeira */
  name: string;
  /** Código do banco (ex: 001 para Banco do Brasil) */
  bankCode: string;
  /** Número da agência */
  branch: string;
  /** Número da conta */
  number: string;
  /** Saldo atual da conta */
  balance: number;
  /** Moeda da conta (BRL, USD, etc.) */
  currencyCode: string;
  /** Data de criação da conta na Pluggy */
  createdAt: string;
  /** Data da última atualização */
  updatedAt: string;
}

/**
 * Interface que representa uma transação financeira.
 * Contém detalhes como valor, descrição, data e categoria.
 */
export interface PluggyTransaction {
  /** ID único da transação */
  id: string;
  /** ID da conta à qual a transação pertence */
  accountId: string;
  /** Descrição da transação */
  description: string;
  /** Valor da transação (positivo para entradas, negativo para saídas) */
  amount: number;
  /** Data da transação no formato ISO */
  date: string;
  /** Categoria da transação (categorizada pela Pluggy) */
  category: string;
  /** Tipo da transação (DEBIT, CREDIT, TRANSFER, etc.) */
  type: string;
  /** Status da transação (POSTED, PENDING, etc.) */
  status: string;
  /** Código de identificação da transação no banco */
  bankTransactionId: string | null;
  /** Data de criação na Pluggy */
  createdAt: string;
}

/**
 * Interface que representa um item (conexão) com uma instituição financeira.
 * Um item pode ter múltiplas contas associadas.
 */
export interface PluggyItem {
  /** ID único do item */
  id: string;
  /** ID do usuário na Pluggy */
  userId: string;
  /** ID do conector (instituição financeira) */
  connectorId: number;
  /** Status do item (UPDATING, CREATED, ERROR, etc.) */
  status: string;
  /** Status de execução da sincronização */
  executionStatus: string;
  /** Mensagem de erro (se houver) */
  errorMessage: string | null;
  /** Data de criação */
  createdAt: string;
  /** Data da última atualização */
  updatedAt: string;
}

/**
 * Interface para o token de conexão retornado pela Pluggy.
 * Usado para autenticar o widget no frontend.
 */
export interface PluggyConnectToken {
  /** Token de acesso para o widget */
  accessToken: string;
  /** Data de expiração do token */
  expiresAt: string;
}

/**
 * Interface para resposta de erro da API Pluggy.
 */
export interface PluggyError {
  /** Código do erro */
  code: string;
  /** Mensagem descritiva do erro */
  message: string;
  /** Detalhes adicionais (opcional) */
  details?: Record<string, unknown>;
}

/**
 * Interface para item salvo no banco de dados local.
 * Relaciona o ID do usuário local com o ID do item na Pluggy.
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
  created_at: Date;
  /** Data da última atualização */
  updated_at: Date;
}
