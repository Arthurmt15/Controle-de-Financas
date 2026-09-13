/**
 * @file src/components/features/OpenFinance/ConnectBank/styles.ts
 * @description Estilos do componente ConnectBank.
 * Estilização do widget de conexão com instituições financeiras.
 */

import styled from 'styled-components';

/** Container overlay do widget */
export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

/** Wrapper do widget */
export const WidgetWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors?.background || '#ffffff'};
  border-radius: 16px;
  padding: 24px;
  position: relative;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

/** Botão de fechar */
export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.backgroundAlt || '#f3f4f6'};
  }
`;

/** Mensagem de carregamento */
export const LoadingMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  padding: 48px 24px;
  font-size: 16px;
`;

/** Mensagem de erro */
export const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
`;
