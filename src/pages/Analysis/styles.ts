import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 640px) {
    justify-content: center;
    text-align: center;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.div<{ $variant: 'income' | 'expense' | 'balance' | 'annual' }>`
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 4px solid ${({ theme, $variant }) => {
    switch ($variant) {
      case 'income': return theme.colors.success;
      case 'expense': return theme.colors.error;
      case 'balance': return theme.colors.primary;
      case 'annual': return theme.colors.primary;
      default: return theme.colors.border;
    }
  }};
`;

export const SummaryLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

export const SummaryValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

export const SummarySubtext = styled.div<{ $positive?: boolean }>`
  font-size: 12px;
  color: ${({ theme, $positive }) => $positive === false ? theme.colors.error : theme.colors.success};
  margin-top: 4px;
`;

export const Section = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
`;

export const SectionDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 20px 0;
`;

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/** Layout responsivo: gráficos à esquerda, chat à direita */
export const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;

    /* Mobile: chat primeiro */
    & > *:nth-child(2) {
      order: -1;
    }
  }
`;

/** Coluna dos gráficos e cards */
export const ChartsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  overflow: hidden;
`;

/** Coluna do chat (sticky no desktop) */
export const ChatColumn = styled.div`
  position: sticky;
  top: 80px;

  @media (max-width: 1024px) {
    position: static;
  }
`;
