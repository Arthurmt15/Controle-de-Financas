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
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export const AddForm = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 20px;
  margin-bottom: 24px;
`;

export const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Input = styled.input`
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

export const Select = styled.select`
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ColorInput = styled.input`
  width: 44px;
  height: 38px;
  padding: 2px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

export const ColorValue = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: monospace;
`;

export const ErrorMessage = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.error};
  margin: 0 0 16px 0;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

export const CategoryCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }
`;

export const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const CategoryColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

export const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const CategoryMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CategoryType = styled.span``;

export const CategoryUsage = styled.span`
  &::before {
    content: '·';
    margin-right: 8px;
  }
`;

export const CategoryActions = styled.div``;

export const DeleteButton = styled.button`
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

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.error}15`};
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const DeleteConfirm = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

export const ConfirmButton = styled.button<{ $variant: 'ghost' | 'danger' }>`
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ theme, $variant }) =>
    $variant === 'ghost'
      ? `
    background-color: transparent;
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};
    
    &:hover {
      background-color: ${theme.colors.surfaceHover};
    }
  `
      : `
    background-color: ${theme.colors.error};
    color: white;
    
    &:hover {
      background-color: #dc2626;
    }
  `}
`;
