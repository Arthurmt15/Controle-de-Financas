/**
 * @file components/features/Dashboard/styles-cards.ts
 * @description Estilos dos cards de resumo e métricas do Dashboard.
 */

import styled from 'styled-components';

/** Grid dos cards de resumo */
export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 16px;

  @media (max-width: 1150px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

/** Card de resumo individual */
export const SummaryCard = styled.div`
  position: relative;
  min-height: 116px;
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: linear-gradient(145deg, #111a2a, #0e1624);

  @media (max-width: 600px) { min-height: 100px; }
`;

/** Ícone do card de resumo */
export const SummaryIcon = styled.div<{ $variant: 'income' | 'expense' | 'balance' | 'annual' }>`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 23px;
  font-weight: 700;
  color: ${({ $variant }) =>
    $variant === 'income' ? '#00c98b' :
    $variant === 'expense' ? '#ff4d55' :
    $variant === 'balance' ? '#a77cff' : '#27a9f4'};
  background: ${({ $variant }) =>
    $variant === 'income' ? 'rgba(0, 201, 139, 0.17)' :
    $variant === 'expense' ? 'rgba(255, 77, 85, 0.17)' :
    $variant === 'balance' ? 'rgba(112, 72, 237, 0.2)' : 'rgba(39, 169, 244, 0.17)'};
`;

/** Label do card de resumo */
export const SummaryLabel = styled.span`
  display: block;
  color: #aeb8c9;
  font-size: 12px;
`;

/** Valor principal do card de resumo */
export const SummaryValue = styled.strong`
  display: block;
  margin-top: 7px;
  font-size: 20px;
`;

/** Subtexto do card de resumo */
export const SummarySubtext = styled.small`
  display: block;
  margin-top: 7px;
  color: #7d899e;
  font-size: 11px;
`;

/** Botão de mais opções no card */
export const DotsButton = styled.button`
  position: absolute;
  right: 12px;
  top: 12px;
  border: 0;
  background: transparent;
  color: #667389;
  letter-spacing: 2px;
  cursor: pointer;
`;
