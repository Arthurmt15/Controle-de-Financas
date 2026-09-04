/**
 * @file pages/Settings/index.tsx
 * @description Página de configurações do sistema.
 * Contém gerenciamento de categorias, orçamento e adição em lote.
 */

import React, { useState } from 'react';
import CategoryManager from '../../components/features/CategoryManager';
import BudgetManager from '../../components/features/BudgetManager';
import BulkTransactionForm from '../../components/features/BulkTransactionForm';
import * as C from './styles';

/** Tipo das abas de configuração */
type SettingsTab = 'categories' | 'budget' | 'bulk';

/**
 * Página de Configurações
 * @returns {JSX.Element} Página renderizada com abas de configuração
 *
 * @example
 * <SettingsPage />
 */
const SettingsPage: React.FC = () => {
  /** Aba ativa atualmente */
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');

  return (
    <C.Container>
      <C.Title>Configurações</C.Title>

      {/* Navegação por abas */}
      <C.Tabs>
        <C.Tab
          $isActive={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
        >
          Categorias
        </C.Tab>
        <C.Tab
          $isActive={activeTab === 'budget'}
          onClick={() => setActiveTab('budget')}
        >
          Orçamento
        </C.Tab>
        <C.Tab
          $isActive={activeTab === 'bulk'}
          onClick={() => setActiveTab('bulk')}
        >
          Adicionar Múltiplos
        </C.Tab>
      </C.Tabs>

      {/* Conteúdo da aba selecionada */}
      <C.Content>
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'budget' && <BudgetManager />}
        {activeTab === 'bulk' && <BulkTransactionForm />}
      </C.Content>
    </C.Container>
  );
};

export default SettingsPage;
