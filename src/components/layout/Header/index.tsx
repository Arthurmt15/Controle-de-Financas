/**
 * @file components/layout/Header/index.tsx
 * @description Componente de cabeçalho principal da aplicação.
 * Exibe logo, navegação, seletor de tema e informações do usuário.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import * as C from './styles';

/**
 * Props do componente Header
 */
interface HeaderProps {
  /** Função para abrir/fechar a sidebar mobile */
  onToggleSidebar?: () => void;
}

/**
 * Componente de cabeçalho principal
 * @param {HeaderProps} props - Props do componente
 * @returns {JSX.Element} Componente Header renderizado
 *
 * @example
 * <Header onToggleSidebar={() => setIsOpen(!isOpen)} />
 */
const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { themeType, toggleTheme } = useTheme();

  return (
    <C.Container>
      <C.LeftSection>
        {/* Botão hamburger para mobile */}
        <C.MenuButton
          onClick={onToggleSidebar}
          aria-label="Abrir menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </C.MenuButton>

        {/* Logo */}
        <C.Logo to="/dashboard">
          <C.LogoIcon>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.93-3.12 3.19z" />
            </svg>
          </C.LogoIcon>
          <C.LogoText>Finanças</C.LogoText>
        </C.Logo>

        {/* Links de navegação */}
        <C.NavLinks>
          <C.NavLink to="/dashboard">Dashboard</C.NavLink>
          <C.NavLink to="/transactions">Transações</C.NavLink>
          <C.NavLink to="/reports">Relatórios</C.NavLink>
          <C.NavLink to="/settings">Configurações</C.NavLink>
        </C.NavLinks>
      </C.LeftSection>

      <C.RightSection>
        {/* Botão de alternar tema */}
        <C.ThemeToggle
          onClick={toggleTheme}
          aria-label={`Alternar para tema ${themeType === 'light' ? 'escuro' : 'claro'}`}
          title={`Tema ${themeType === 'light' ? 'escuro' : 'claro'}`}
        >
          {themeType === 'light' ? (
            // Ícone de lua (modo escuro)
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            // Ícone de sol (modo claro)
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </C.ThemeToggle>

        {/* Informações do usuário */}
        {user && (
          <C.UserSection>
            <C.UserAvatar>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </C.UserAvatar>
            <C.UserInfo>
              <C.UserName>{user.name}</C.UserName>
              <C.UserEmail>{user.email}</C.UserEmail>
            </C.UserInfo>
            <C.LogoutButton
              onClick={logout}
              aria-label="Sair da conta"
              title="Sair"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </C.LogoutButton>
          </C.UserSection>
        )}
      </C.RightSection>
    </C.Container>
  );
};

export default Header;
