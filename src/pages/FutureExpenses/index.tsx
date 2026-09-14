/**
 * @file pages/FutureExpenses/index.tsx
 * @description Página de gerenciamento de despesas futuras.
 * Permite planejar gastos que ainda vão acontecer.
 */

import React, { useState } from 'react';
import FutureExpenseForm from '../../components/features/FutureExpenses/Form';
import FutureExpenseList from '../../components/features/FutureExpenses/List';
import * as C from './styles';

/** Página de Despesas Futuras */
const FutureExpensesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <C.Container>
      <C.Header>
        <C.Title>Despesas Futuras</C.Title>
        <C.Subtitle>Planeje seus gastos que ainda vão acontecer</C.Subtitle>
      </C.Header>

      <C.Actions>
        <C.AddButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Despesa Futura'}
        </C.AddButton>
      </C.Actions>

      {showForm && (
        <C.FormSection>
          <FutureExpenseForm onClose={() => setShowForm(false)} />
        </C.FormSection>
      )}

      <C.ListSection>
        <FutureExpenseList />
      </C.ListSection>
    </C.Container>
  );
};

export default FutureExpensesPage;
