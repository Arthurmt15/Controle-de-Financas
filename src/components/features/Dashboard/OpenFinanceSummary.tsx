/**
 * @file src/components/features/Dashboard/OpenFinanceSummary.tsx
 * @description Componente que exibe resumo das contas Open Finance no Dashboard.
 * Mostra total de bancos conectados e saldos consolidados.
 */

import React, { useEffect } from 'react';
import { useOpenFinance } from '../../../contexts/OpenFinanceContext';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/** Container do card */
const Card = styled.div`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
`;

/** Título do card */
const Title = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/** Valor principal exibido */
const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
  margin-bottom: 8px;
`;

/** Subtítulo com detalhes */
const Subtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0 0 16px 0;
`;

/** Link para a página Open Finance */
const StyledLink = styled(Link)`
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

/** Mensagem quando não há contas conectadas */
const EmptyMessage = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  margin: 0 0 12px 0;
`;

/**
 * Formata valor monetário para exibição.
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Componente que exibe resumo do Open Finance no Dashboard.
 * Mostra quantidade de bancos e saldo total.
 */
const OpenFinanceSummary: React.FC = () => {
  const { accounts, items, loading, loadItems, loadAllAccounts } = useOpenFinance();

  /** Carrega dados ao montar o componente */
  useEffect(() => {
    loadItems();
    loadAllAccounts();
  }, [loadItems, loadAllAccounts]);

  /** Calcula saldo total de todas as contas */
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (loading) {
    return (
      <Card>
        <Title>Open Finance</Title>
        <Subtitle>Carregando...</Subtitle>
      </Card>
    );
  }

  return (
    <Card>
      <Title>Open Finance</Title>

      {items.length === 0 ? (
        <>
          <EmptyMessage>Nenhuma instituição conectada</EmptyMessage>
          <StyledLink to="/open-finance">Conectar banco</StyledLink>
        </>
      ) : (
        <>
          <Value>{formatCurrency(totalBalance)}</Value>
          <Subtitle>
            {items.length} {items.length === 1 ? 'banco' : 'bancos'} conectado{items.length !== 1 && 's'}
          </Subtitle>
          <StyledLink to="/open-finance">Ver detalhes</StyledLink>
        </>
      )}
    </Card>
  );
};

export default OpenFinanceSummary;
