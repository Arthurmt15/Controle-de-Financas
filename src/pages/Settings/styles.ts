import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const Tab = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $isActive }) => ($isActive ? 'white' : theme.colors.text)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primaryHover : theme.colors.surfaceHover};
  }
`;

export const Content = styled.div`
  width: 100%;
`;
