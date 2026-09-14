/**
 * @file src/pages/OpenFinance/index.tsx
 * @description Página principal do Open Finance Brasil.
 * Exibe widget de conexão, lista de contas e transações.
 */

import React, { useEffect, useState } from 'react';
import { useOpenFinance } from '../../contexts/OpenFinanceContext';
import ConnectBank from '../../components/features/OpenFinance/ConnectBank';
import AccountList from '../../components/features/OpenFinance/AccountList';
import TransactionList from '../../components/features/OpenFinance/TransactionList';
import { Container, Title, Section, EmptyState, ErrorMessage } from './styles';

/**
 * Página do Open Finance Brasil.
 * Gerencia conexões com instituições financeiras via Pluggy API.
 */
const OpenFinancePage: React.FC = () => {
  const {
    accounts,
    items,
    loading,
    error,
    selectedAccountId,
    loadItems,
    loadAllAccounts,
    selectAccount,
  } = useOpenFinance();

  const [showConnectWidget, setShowConnectWidget] = useState(false);

  /** Carrega itens e contas ao montar o componente */
  useEffect(() => {
    loadItems();
    loadAllAccounts();
  }, [loadItems, loadAllAccounts]);

  /**
   * Manipula sucesso na conexão de um banco.
   * Recarrega lista de itens e contas.
   */
  const handleConnectSuccess = () => {
    setShowConnectWidget(false);
    loadItems();
    loadAllAccounts();
  };

  /**
   * Manipula erro na conexão.
   * Exibe mensagem de erro para o usuário.
   */
  const handleConnectError = (errorMessage: string) => {
    console.error('Erro na conexão:', errorMessage);
  };

  return (
    <Container>
      <Title>Open Finance Brasil</Title>

      {error && (
        <EmptyState>
          <p>{error}</p>
          {!showConnectWidget && (
            <button onClick={() => setShowConnectWidget(true)} disabled={loading}>
              Conectar Banco
            </button>
          )}
        </EmptyState>
      )}

      <Section>
        <h2>Conexões Ativas</h2>
        {items.length > 0 ? (
          <AccountList
            accounts={accounts}
            loading={loading}
            onSelectAccount={selectAccount}
            selectedAccountId={selectedAccountId}
          />
        ) : (
          <EmptyState>
            <p>Nenhuma instituição conectada</p>
            <p>Conecte seu banco para importar contas e transações automaticamente.</p>
          </EmptyState>
        )}
      </Section>

      <Section>
        <h2>Transações</h2>
        {selectedAccountId ? (
          <TransactionList accountId={selectedAccountId} />
        ) : (
          <EmptyState>
            <p>Selecione uma conta para ver as transações</p>
          </EmptyState>
        )}
      </Section>

      {showConnectWidget && (
        <ConnectBank
          onSuccess={handleConnectSuccess}
          onError={handleConnectError}
          onClose={() => setShowConnectWidget(false)}
        />
      )}

      {!showConnectWidget && (
        <button onClick={() => setShowConnectWidget(true)} disabled={loading}>
          {loading ? 'Carregando...' : 'Conectar Nova Instituição'}
        </button>
      )}
    </Container>
  );
};

export default OpenFinancePage;
