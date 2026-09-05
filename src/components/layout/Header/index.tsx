/**
 * @file components/layout/Header/index.tsx
 * @description Componente de cabeçalho principal da aplicação.
 * Exibe logo, navegação, seletor de tema, seletor de cor e informações do usuário.
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../common/Icon';
import ColorPicker from '../../common/ColorPicker';
import * as C from './styles';

/** Itens de navegação do menu mobile */
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/transactions', label: 'Transações' },
  { path: '/reports', label: 'Relatórios' },
  { path: '/settings', label: 'Configurações' },
];

/**
 * Componente de cabeçalho principal
 * @returns {JSX.Element} Componente Header renderizado
 */
const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { themeType, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  /** Alterna o menu mobile */
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  /** Fecha o menu mobile */
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <C.Container>
      <C.LeftSection>
        <C.MenuButton onClick={toggleMenu} aria-label="Abrir menu">
          <Icon size={24}>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </Icon>
        </C.MenuButton>

        <C.Logo to="/dashboard">
          <C.LogoIcon>
            <Icon size={24} color="white">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </Icon>
          </C.LogoIcon>
          <C.LogoText>Finanças</C.LogoText>
        </C.Logo>

        <C.NavLinks>
          {NAV_ITEMS.map(({ path, label }) => (
            <C.NavLink key={path} to={path}>{label}</C.NavLink>
          ))}
        </C.NavLinks>
      </C.LeftSection>

      <C.RightSection>
        <ColorPicker />
        <C.ThemeToggle onClick={toggleTheme} title={`Tema ${themeType === 'light' ? 'escuro' : 'claro'}`}>
          {themeType === 'light' ? (
            <Icon>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </Icon>
          ) : (
            <Icon>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </Icon>
          )}
        </C.ThemeToggle>

        {user && (
          <C.UserSection>
            <C.UserAvatar>
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
            </C.UserAvatar>
            <C.UserInfo>
              <C.UserName>{user.name}</C.UserName>
              <C.UserEmail>{user.email}</C.UserEmail>
            </C.UserInfo>
            <C.LogoutButton onClick={logout} aria-label="Sair" title="Sair">
              <Icon>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </Icon>
            </C.LogoutButton>
          </C.UserSection>
        )}
      </C.RightSection>

      <C.MobileOverlay $isOpen={menuOpen} onClick={closeMenu} />
      <C.MobileMenu $isOpen={menuOpen}>
        <C.CloseButton onClick={closeMenu} aria-label="Fechar menu">
          <Icon size={24}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </Icon>
        </C.CloseButton>
        {NAV_ITEMS.map(({ path, label }) => (
          <C.MobileNavLink key={path} to={path} onClick={closeMenu}>
            {label}
          </C.MobileNavLink>
        ))}
        <C.MobileNavLink to="/login" onClick={() => { closeMenu(); logout(); }}>
          Sair
        </C.MobileNavLink>
      </C.MobileMenu>
    </C.Container>
  );
};

export default Header;