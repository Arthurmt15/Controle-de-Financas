/**
 * @file components/features/Dashboard/styles-cards.ts
 * @description Estilos dos cards de resumo e métricas do Dashboard.
 * Contém estilos para grid de cards, cards individuais, ícones e textos.
 */

import styled from 'styled-components';

/**
 * Grid responsivo para cards de resumo
 * Utiliza CSS Grid com 4 colunas em desktop
 * Em telas médias, 2 colunas; em telas pequenas, 1 coluna
 */
export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 16px;
  @media (max-width: 1150px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

/**
 * Card de resumo individual
 * Exibe uma métrica financeira com ícone, valor e subtexto
 * Layout flexível para alinhar itens horizontalmente
 */
export const SummaryCard = styled.div`
  position: relative;
  min-height: 116px;
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.type === 'dark'
    ? 'linear-gradient(145deg, #111a2a, #0e1624)'
    : theme.colors.surface};
  @media (max-width: 600px) { min-height: 100px; }
`;

/**
 * Ícone do card de resumo
 * Container circular com cor baseada no tipo de métrica
 * @param {'income' | 'expense' | 'balance' | 'annual'} $variant - Tipo da métrica
 */
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
  color: ${({ $variant, theme }) =>
    $variant === 'income' ? theme.colors.success :
    $variant === 'expense' ? theme.colors.error :
    $variant === 'balance' ? theme.colors.primary : theme.colors.info};
  background: ${({ $variant, theme }) =>
    $variant === 'income' ? `${theme.colors.success}28` :
    $variant === 'expense' ? `${theme.colors.error}28` :
    $variant === 'balance' ? `${theme.colors.primary}30` : `${theme.colors.info}28`};
`;

/**
 * Rótulo/descrição do card
 * Texto pequeno e secundário que descreve a métrica
 */
export const SummaryLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

/**
 * Valor principal do card
 * Texto grande e negrito que exibe o valor formatado
 */
export const SummaryValue = styled.strong`
  display: block;
  margin-top: 7px;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Texto secundário do card
 * Exibe informações complementares como variação percentual
 */
export const SummarySubtext = styled.small`
  display: block;
  margin-top: 7px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
`;

/**
 * Botão de opções (três pontos)
 * Posicionado no canto superior direito do card
 * Transparente por padrão, com hover sutil
 */
export const DotsButton = styled.button`
  position: absolute;
  right: 12px;
  top: 12px;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 2px;
  cursor: pointer;
`;
