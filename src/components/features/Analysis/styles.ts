import styled from 'styled-components';

export const Section = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
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

export const InsightList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const InsightCard = styled.div<{ $type: 'warning' | 'tip' | 'info' | 'alert' }>`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $type }) => {
    switch ($type) {
      case 'warning': return `${theme.colors.warning}15`;
      case 'tip': return `${theme.colors.success}15`;
      case 'info': return `${theme.colors.primary}15`;
      case 'alert': return `${theme.colors.error}15`;
      default: return theme.colors.surface;
    }
  }};
  border: 1px solid ${({ theme, $type }) => {
    switch ($type) {
      case 'warning': return `${theme.colors.warning}40`;
      case 'tip': return `${theme.colors.success}40`;
      case 'info': return `${theme.colors.primary}40`;
      case 'alert': return `${theme.colors.error}40`;
      default: return theme.colors.border;
    }
  }};
`;

export const InsightIcon = styled.div<{ $type: 'warning' | 'tip' | 'info' | 'alert' }>`
  font-size: 20px;
  line-height: 1;
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'warning': return theme.colors.warning;
      case 'tip': return theme.colors.success;
      case 'info': return theme.colors.primary;
      case 'alert': return theme.colors.error;
      default: return theme.colors.text;
    }
  }};
`;

export const InsightContent = styled.div`
  flex: 1;
`;

export const InsightTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

export const InsightText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

export const CategoryBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export const CategoryName = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  min-width: 120px;
`;

export const BarContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

export const BarFill = styled.div<{ $width: number; $color: string }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const CategoryValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  min-width: 100px;
  text-align: right;
`;

export const CategoryPercent = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 50px;
  text-align: right;
`;

export const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ComparisonCard = styled.div`
  text-align: center;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ComparisonLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
`;

export const ComparisonValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const ComparisonChange = styled.div<{ $positive: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme, $positive }) => $positive ? theme.colors.success : theme.colors.error};
  margin-top: 4px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;

  span {
    font-size: 40px;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;
