/**
 * @file pages/Installments/index.tsx
 * @description Página de gerenciamento de compras parceladas.
 * Permite criar, editar e controlar prestações.
 */

import React, { useState } from 'react';
import InstallmentForm from '../../components/features/Installments/Form';
import InstallmentList from '../../components/features/Installments/List';
import * as C from './styles';

/** Página de Parcelados */
const InstallmentsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <C.Container>
      <C.Header>
        <C.Title>Parcelados</C.Title>
        <C.Subtitle>Controle suas compras parceladas e prestações</C.Subtitle>
      </C.Header>

      <C.Actions>
        <C.AddButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Compra Parcelada'}
        </C.AddButton>
      </C.Actions>

      {showForm && (
        <C.FormSection>
          <InstallmentForm onClose={() => setShowForm(false)} />
        </C.FormSection>
      )}

      <C.ListSection>
        <InstallmentList />
      </C.ListSection>
    </C.Container>
  );
};

export default InstallmentsPage;
