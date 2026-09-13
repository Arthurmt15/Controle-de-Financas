/**
 * @file src/components/features/OpenFinance/AccountList/styles.ts
 * @description Estilos do componente AccountList.
 * Estilização dos cards de contas financeiras.
 */

import styled from 'styled-components';

/** Container da lista de contas */
export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

/** Card de conta */
export const AccountCard = styled.div<{ isSelected: boolean }>`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border: 2px solid ${({ isSelected, theme }) =>
    isSelected ? theme.colors?.primary || '#6366f1' : theme.colors?.border || '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

/** Informações do banco */
export const BankInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .bank-icon {
    font-size: 32px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    margin: 0;
  }

  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
    margin: 4px 0 0 0;
    text-transform: uppercase;
  }
`;

/** Detalhes da conta (agência e número) */
export const AccountDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

/** Saldo da conta */
export const Balance = styled.div<{ isPositive: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ isPositive, theme }) =>
    isPositive ? theme.colors?.success || '#10b981' : theme.colors?.error || '#ef4444'};
  margin-bottom: 16px;
`;

/** Botão para ver transações */
export const SelectButton = styled.button`
  background-color: ${({ theme }) => theme.colors?.primary || '#6366f1'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.primaryDark || '#4f46e5'};
  }
`;

/** Botão para remover conexão */
export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  margin-left: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: #fef2f2;
    color: #dc2626;
  }
`;

/** Container de carregamento */
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  font-size: 16px;
`;
