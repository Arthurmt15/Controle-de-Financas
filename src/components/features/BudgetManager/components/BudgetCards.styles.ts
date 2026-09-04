/**
 * @file components/features/BudgetManager/components/BudgetCards.styles.ts
 * @description Estilos dos cards de orçamento por categoria.
 */

import styled from 'styled-components';

/** Grid responsivo de cards */
export const BudgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

/** Estado vazio */
export const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
`;

/** Ícone do estado vazio */
export const EmptyIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** Texto do estado vazio */
export const EmptyText = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
`;

/** Dica do estado vazio */
export const EmptyHint = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

/** Card individual de orçamento */
export const BudgetCard = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/** Cabeçalho do card */
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/** Informações da categoria */
export const CardCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

/** Ponto de cor da categoria */
export const CategoryDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

/** Nome da categoria */
export const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

/** Botão de excluir */
export const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.error}15`};
    color: ${({ theme }) => theme.colors.error};
  }
`;

/** Seção de progresso */
export const CardProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

/** Cabeçalho do progresso */
export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

/** Valor gasto */
export const ProgressSpent = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

/** Limite da categoria */
export const ProgressLimit = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** Faixa de progresso */
export const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
`;

/** Preenchimento da barra de progresso */
export const ProgressFillLarge = styled.div<{ $percentage: number; $color: string }>`
  width: ${({ $percentage }) => $percentage}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

/** Rodapé do card */
export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

/** Item do rodapé */
export const FooterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

/** Label do rodapé */
export const FooterLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/** Valor do rodapé */
export const FooterValue = styled.span<{ $type: 'income' | 'expense' }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
`;

/** Porcentagem do rodapé */
export const FooterPercentage = styled.span<{ $color: string }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;
