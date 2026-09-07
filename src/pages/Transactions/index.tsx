/**
 * @file pages/Transactions/index.tsx
 * @description Página de gerenciamento de transações.
 * Inclui chat rápido, formulário e lista de transações.
 */

import React, { useState } from 'react';
import TransactionChat from '../../components/features/TransactionChat';
import ImageUploader from '../../components/features/ImageUploader';
import TransactionForm from '../../components/features/TransactionForm';
import TransactionList from '../../components/features/TransactionList';
import * as C from './styles';

/**
 * Página de Transações
 * @returns {JSX.Element} Página renderizada
 *
 * @example
 * <TransactionsPage />
 */
const TransactionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');

  return (
    <C.Container>
      {/* Abas para alternar entre Chat e Formulário */}
      <C.TabContainer>
        <C.Tab
          $isActive={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat Rápido
        </C.Tab>
        <C.Tab
          $isActive={activeTab === 'form'}
          onClick={() => setActiveTab('form')}
        >
          📝 Formulário
        </C.Tab>
      </C.TabContainer>

      {/* Conteúdo baseado na aba ativa */}
      <C.FormSection>
        {activeTab === 'chat' ? (
          <C.ChatLayout>
            <C.ChatColumn>
              <TransactionChat />
            </C.ChatColumn>
            <C.UploadColumn>
              <ImageUploader />
            </C.UploadColumn>
          </C.ChatLayout>
        ) : (
          <TransactionForm />
        )}
      </C.FormSection>

      <C.ListSection>
        <TransactionList />
      </C.ListSection>
    </C.Container>
  );
};

export default TransactionsPage;
