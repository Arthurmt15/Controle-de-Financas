import styled from 'styled-components';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export const ItemCount = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  padding: 4px 10px;
  border-radius: 12px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const TypeSelector = styled.div`
  display: flex;
  gap: 8px;
`;

export const TypeButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $isActive }) => ($isActive ? 'white' : theme.colors.text)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const DateField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 200px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DateInput = styled.input`
  padding: 10px 14px;
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

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

export const ItemIndex = styled.span`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

export const ItemFields = styled.div`
  display: flex;
  flex: 1;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ItemInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ItemSelect = styled.select`
  flex: 1;
  padding: 10px 14px;
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

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => `${theme.colors.error}15`};
    color: ${({ theme }) => theme.colors.error};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const Total = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: right;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const SuccessMessage = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.success};
  background-color: ${({ theme }) => `${theme.colors.success}15`};
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: center;
`;
