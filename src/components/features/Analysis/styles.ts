import styled from 'styled-components';

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

export const InsightList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const InsightCard = styled.div<{ $type: 'warning' | 'tip' | 'info' | 'alert' }>`
  display: flex;
  gap: 12px;
  padding: 14px;
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

  @media (max-width: 480px) {
    padding: 12px;
    gap: 10px;
  }
`;

export const InsightIcon = styled.div<{ $type: 'warning' | 'tip' | 'info' | 'alert' }>`
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
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
  min-width: 0;
`;

export const InsightTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`;

export const InsightText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

export const CategoryBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr auto;
    gap: 6px 8px;
  }
`;

export const CategoryName = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    grid-column: 1;
  }
`;

export const BarContainer = styled.div`
  height: 6px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  overflow: hidden;

  @media (max-width: 480px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

export const BarFill = styled.div<{ $width: number; $color: string }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

export const CategoryValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: right;
  white-space: nowrap;

  @media (max-width: 480px) {
    grid-column: 2;
    grid-row: 1;
    font-size: 12px;
  }
`;

export const CategoryPercent = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: right;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const ComparisonCard = styled.div`
  text-align: center;
  padding: 14px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const ComparisonLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 6px;
`;

export const ComparisonValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const ComparisonChange = styled.div<{ $positive: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme, $positive }) => $positive ? theme.colors.success : theme.colors.error};
  margin-top: 4px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;

  span {
    font-size: 36px;
    margin-bottom: 10px;
  }

  p {
    font-size: 13px;
    margin: 0;
  }
`;
