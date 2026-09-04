/**
 * @file components/features/Dashboard/styles-charts.ts
 * @description Estilos dos gráficos, painéis e transações do Dashboard.
 */

import styled from 'styled-components';

/** Grid dos gráficos */
export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 850px) { grid-template-columns: 1fr; }
`;

/** Container do painel de gráfico */
export const Panel = styled.div<{ $height?: string }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: linear-gradient(145deg, #111a2a, #0e1624);
  overflow: hidden;
  height: ${({ $height }) => $height || 'auto'};

  @media (max-width: 850px) { height: 380px; }
  @media (max-width: 600px) { height: 350px; }
`;

/** Cabeçalho do painel */
export const PanelHeader = styled.div`
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 21px;
  h2 { font-size: 15px; }
  @media (max-width: 600px) {
    padding: 0 15px;
    h2 { font-size: 14px; }
  }
`;

/** Select dentro do painel */
export const PanelSelect = styled.select`
  height: 35px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 7px;
  background: #111a2a;
  color: #c1c9d6;
  font-size: 12px;

  @media (max-width: 600px) { font-size: 10px; padding: 0 8px; }
`;

/** Mensagem de gráfico vazio */
export const EmptyChartMessage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  strong { font-size: 13px; }
  span { color: #8995a9; font-size: 12px; }
`;

/** Ícone de gráfico vazio */
export const EmptyIcon = styled.div`
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(135, 79, 255, 0.25);
  border-radius: 16px;
  background: rgba(112, 72, 237, 0.13);
  color: #9d73ff;
  font-size: 25px;
`;

/** Legenda do gráfico */
export const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-top: 13px;
  color: #a6b0c1;
  font-size: 12px;
  span { display: flex; align-items: center; gap: 7px; }
`;

/** Ponto de cor na legenda */
export const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

/** Mensagem de categoria vazia */
export const CategoryEmpty = styled.div`
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  text-align: center;
  strong { font-size: 13px; }
  span { color: #8995a9; font-size: 12px; }
`;

/** Ícone de categoria vazia */
export const CategoryIcon = styled.div`
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(135, 79, 255, 0.25);
  border-radius: 16px;
  background: rgba(112, 72, 237, 0.13);
  color: #9d73ff;
  font-size: 25px;
`;

/** Container da seção de transações recentes */
export const Transactions = styled.div`
  margin-top: 15px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: linear-gradient(145deg, #111a2a, #0e1624);
  overflow: hidden;
`;

/** Cabeçalho da seção de transações */
export const TransactionsHeader = styled.div`
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 21px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 { font-size: 15px; }
`;

/** Container vazio de transações */
export const TransactionsEmpty = styled.div`
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
`;

/** Ícone de transação */
export const TransactionIcon = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 9px;
  font-size: 18px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
