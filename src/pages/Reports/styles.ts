import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export const ExportButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FiltersBar = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FilterInput = styled.input`
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const FilterSelect = styled.select`
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.div<{ $type: 'income' | 'expense' }>`
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 4px solid ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success : theme.colors.error};
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
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

export const EmptyChart = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const TableCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Thead = styled.thead`
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

export const Tbody = styled.tbody``;

export const Tr = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ExpenseValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.error};
`;

export const CategoryBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: ${({ $color }) => $color};
  border-radius: 12px;
`;

export const EmptyRow = styled.tr``;

export const EmptyCell = styled.td`
  text-align: center;
  padding: 40px 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
