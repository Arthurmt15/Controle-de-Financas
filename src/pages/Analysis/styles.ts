import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const Header = styled.div`
  text-align: center;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 4px 0 0;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
`;

export const SummaryCard = styled.div<{ $variant: 'income' | 'expense' | 'balance' | 'annual' }>`
  padding: 16px;
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

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const SummarySubtext = styled.div<{ $positive?: boolean }>`
  font-size: 11px;
  color: ${({ theme, $positive }) => $positive === false ? theme.colors.error : theme.colors.success};
  margin-top: 4px;
`;

export const Section = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 480px) {
    padding: 14px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 6px 0;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

export const SectionDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px 0;
`;

export const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const ChartsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  overflow: hidden;
`;

export const ChatColumn = styled.div`
  position: sticky;
  top: 80px;

  @media (max-width: 1024px) {
    position: static;
  }
`;
