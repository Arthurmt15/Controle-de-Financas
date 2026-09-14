/**
 * @file src/pages/OpenFinance/index.tsx
 * @description Página principal do Open Finance Brasil.
 * Exibe widget de conexão, lista de contas e transações.
 * Inclui detecção automática de parcelados.
 */

import React, { useEffect, useState } from 'react';
import { useOpenFinance } from '../../contexts/OpenFinanceContext';
import { useInstallments } from '../../contexts/InstallmentsContext';
import { useTransactions } from '../../hooks/useTransactions';
import ConnectBank from '../../components/features/OpenFinance/ConnectBank';
import AccountList from '../../components/features/OpenFinance/AccountList';
import TransactionList from '../../components/features/OpenFinance/TransactionList';
import { detectInstallments, toInstallments } from '../../utils/installmentDetector';
import { Container, Title, Section, EmptyState } from './styles';

/**
 * Página do Open Finance Brasil.
 * Gerencia conexões com instituições financeiras via Pluggy API.
 */
const OpenFinancePage: React.FC = () => {
  const {
    accounts,
    items,
    transactions: openFinanceTransactions,
    loading,
    error,
    selectedAccountId,
    loadItems,
    loadAllAccounts,
    selectAccount,
  } = useOpenFinance();

  const { addInstallment } = useInstallments();
  const { categories } = useTransactions();

  const [showConnectWidget, setShowConnectWidget] = useState(false);
  const [detectingInstallments, setDetectingInstallments] = useState(false);

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

  /**
   * Detecta e importa parcelados das transações do Open Finance.
   * Analisa descrições para identificar padrões de parcelamento.
   */
  const handleDetectInstallments = async () => {
    if (openFinanceTransactions.length === 0) {
      alert('Nenhuma transação disponível para análise. Selecione uma conta primeiro.');
      return;
    }

    setDetectingInstallments(true);
    try {
      // Encontra uma categoria de despesa para usar como padrão
      const expenseCategory = categories.find(
        (c) => c.defaultType === 'expense' || c.defaultType === 'both'
      );

      if (!expenseCategory) {
        alert('Nenhuma categoria de despesa encontrada. Crie uma categoria primeiro.');
        return;
      }

      const detected = detectInstallments(openFinanceTransactions);

      if (detected.length === 0) {
        alert('Nenhum parcelado detectado nas transações.');
        return;
      }

      const confirm = window.confirm(
        `Foram detectados ${detected.length} parcelado(s). Deseja importá-los?`
      );

      if (confirm) {
        const installments = toInstallments(detected, expenseCategory.id);
        for (const installment of installments) {
          await addInstallment(installment);
        }
        alert(`${installments.length} parcelado(s) importado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao detectar parcelados:', error);
      alert('Erro ao detectar parcelados. Tente novamente.');
    } finally {
      setDetectingInstallments(false);
    }
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

      {/* Botão de detecção de parcelados */}
      {openFinanceTransactions.length > 0 && (
        <Section>
          <h2>Importação Automática</h2>
          <EmptyState>
            <p>Analise suas transações para detectar compras parceladas automaticamente.</p>
            <button
              onClick={handleDetectInstallments}
              disabled={detectingInstallments}
            >
              {detectingInstallments ? 'Analisando...' : 'Detectar Parcelados'}
            </button>
          </EmptyState>
        </Section>
      )}

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
