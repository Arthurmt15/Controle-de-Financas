/**
 * @file components/layout/Header/styles.ts
 * @description Estilos do componente Header utilizing styled-components.
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * Container principal do header
 */
export const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
`;

/**
 * Seção esquerda do header
 */
export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

/**
 * Links de navegação
 */
export const NavLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Container dos links de navegação
 */
export const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 24px;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Botão hamburger para mobile
 */
export const MenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

/**
 * Logo (link)
 */
export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`;

/**
 * Ícone do logo
 */
export const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

/**
 * Texto do logo
 */
export const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 480px) {
    display: none;
  }
`;

/**
 * Seção direita do header
 */
export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

/**
 * Botão de alternar tema
 */
export const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: rotate(15deg);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Seção do usuário
 */
export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surfaceHover};

  @media (max-width: 600px) {
    display: none;
  }
`;

/**
 * Avatar do usuário
 */
export const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

/**
 * Informações do usuário
 */
export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Nome do usuário
 */
export const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Email do usuário
 */
export const UserEmail = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Botão de logout
 */
export const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.error};
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.error};
  }
`;
