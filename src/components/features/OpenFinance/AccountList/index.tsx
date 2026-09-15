/**
 * @file src/components/features/OpenFinance/AccountList/index.tsx
 * @description Componente que exibe a lista de contas conectadas.
 * Mostra informações como banco, agência, conta e saldo.
 */

import React from 'react';
import { OpenFinanceAccount } from '../../../../types/openFinance';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import {
  Container,
  AccountCard,
  BankInfo,
  AccountDetails,
  Balance,
  SelectButton,
  RemoveButton,
  LoadingContainer,
} from './styles';

/** Props do componente AccountList */
interface AccountListProps {
  /** Lista de contas para exibir */
  accounts: OpenFinanceAccount[];
  /** Indica se está carregando */
  loading: boolean;
  /** Callback para selecionar uma conta */
  onSelectAccount: (accountId: string) => void;
  /** ID da conta selecionada */
  selectedAccountId: string | null;
}

/**
 * Formata o valor monetário para exibição.
 * @param amount Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Retorna o ícone baseado no tipo da conta.
 * @param type Tipo da conta
 * @returns Emoji representativo do tipo
 */
function getAccountTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    CHECKING: '',
    SAVINGS: '',
    CREDIT_CARD: '',
    INVESTMENT: '',
    LOAN: '',
  };
  return icons[type] || '';
}

/**
 * Componente que exibe lista de contas financeiras conectadas.
 */
const AccountList: React.FC<AccountListProps> = ({
  accounts,
  loading,
  onSelectAccount,
  selectedAccountId,
}) => {
  const { removeItem } = useOpenFinance();

  /**
   * Manipula a remoção de uma conta.
   * Solicita confirmação antes de remover.
   */
  const handleRemove = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja desconectar esta instituição?')) {
      await removeItem(itemId);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <span>Carregando contas...</span>
      </LoadingContainer>
    );
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <Container>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          isSelected={selectedAccountId === account.id}
          onClick={() => onSelectAccount(account.id)}
        >
          <BankInfo>
            <span className="bank-icon">{getAccountTypeIcon(account.type)}</span>
            <div>
              <h3>{account.name}</h3>
              <p>{account.type}</p>
            </div>
          </BankInfo>

          <AccountDetails>
            <span>Ag: {account.branch}</span>
            <span>Conta: {account.number}</span>
          </AccountDetails>

          <Balance isPositive={account.balance >= 0}>
            {formatCurrency(account.balance)}
          </Balance>

          <div>
            <SelectButton
              onClick={(e) => {
                e.stopPropagation();
                onSelectAccount(account.id);
              }}
            >
              Ver Transações
            </SelectButton>
            <RemoveButton
              onClick={(e) => handleRemove(account.itemId, e)}
              aria-label="Desconectar instituição"
            >
              ×
            </RemoveButton>
          </div>
        </AccountCard>
      ))}
    </Container>
  );
};

export default AccountList;
