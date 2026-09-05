/**
 * @file components/features/Dashboard/styles-charts.ts
 * @description Estilos dos gráficos, painéis e transações do Dashboard.
 * Contém estilos para grid de gráficos, painéis, legendas e lista de transações.
 */

import styled from 'styled-components';

/**
 * Grid responsivo para layout dos gráficos
 * Utiliza CSS Grid para organizar gráficos lado a lado
 * Em telas pequenas, empilha verticalmente
 */
export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  @media (max-width: 850px) { grid-template-columns: 1fr; }
`;

/**
 * Painel container para gráficos
 * Posição relativa para permitir posicionamento absoluto de elementos filhos
 * Altura configurável via prop $height
 * @param {string} $height - Altura personalizada do painel
 */
export const Panel = styled.div<{ $height?: string }>`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.type === 'dark'
    ? 'linear-gradient(145deg, #111a2a, #0e1624)'
    : theme.colors.surface};
  overflow: hidden;
  height: ${({ $height }) => $height || 'auto'};
  @media (max-width: 850px) { height: 380px; }
  @media (max-width: 600px) { height: 350px; }
`;

/**
 * Cabeçalho do painel
 * Contém título e controles de filtro
 * Altura fixa para alinhamento consistente
 */
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

/**
 * Select dropdown para filtros do painel
 * Estilizado para combinar com o design do tema
 */
export const PanelSelect = styled.select`
  height: 35px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  @media (max-width: 600px) { font-size: 10px; padding: 0 8px; }
`;

/**
 * Mensagem de estado vazio para gráficos
 * Posicionamento absoluto para cobrir todo o painel
 * pointer-events: none para não bloquear cliques em elementos subjacentes
 */
export const EmptyChartMessage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  pointer-events: none;
  strong { font-size: 13px; }
  span { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 12px; }
`;

/**
 * Ícone de estado vazio para gráficos
 * Container circular com borda e fundo semi-transparente
 */
export const EmptyIcon = styled.div`
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => `${theme.colors.primary}40`};
  border-radius: 16px;
  background: ${({ theme }) => `${theme.colors.primary}20`};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 25px;
`;

/**
 * Container da legenda dos gráficos
 * Centraliza itens de legenda horizontalmente
 */
export const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-top: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  span { display: flex; align-items: center; gap: 7px; }
`;

/**
 * Dot indicador de cor na legenda
 * Circulo pequeno que representa a cor da série no gráfico
 * @param {string} $color - Cor do dot
 */
export const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

/**
 * Mensagem de estado vazio para categorias
 * Altura fixa para manter consistência visual
 * pointer-events: none para não bloquear cliques
 */
export const CategoryEmpty = styled.div`
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  text-align: center;
  pointer-events: none;
  strong { font-size: 13px; }
  span { color: ${({ theme }) => theme.colors.textSecondary}; font-size: 12px; }
`;

/**
 * Ícone de estado vazio para categorias
 * Container circular com borda e fundo semi-transparente
 */
export const CategoryIcon = styled.div`
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => `${theme.colors.primary}40`};
  border-radius: 16px;
  background: ${({ theme }) => `${theme.colors.primary}20`};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 25px;
`;

/**
 * Container da lista de transações
 * Bordas e background consistente com o tema
 */
export const Transactions = styled.div`
  margin-top: 15px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.type === 'dark'
    ? 'linear-gradient(145deg, #111a2a, #0e1624)'
    : theme.colors.surface};
  overflow: hidden;
`;

/**
 * Cabeçalho da seção de transações
 * Contém título e separador visual
 */
export const TransactionsHeader = styled.div`
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 21px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 { font-size: 15px; }
`;

/**
 * Mensagem de estado vazio para transações
 * Altura fixa para manter layout consistente
 */
export const TransactionsEmpty = styled.div`
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
`;

/**
 * Ícone de tipo de transação
 * Container quadrado com bordas arredondadas
 * Usado para exibir ícones de entrada/saída
 */
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
