/**
 * @file components/layout/Header/index.tsx
 * @description Cabeçalho premium com drawer mobile redesenhado para telas pequenas.
 * Navegação com ícones, estado ativo, user card e safe-area.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useInstallPrompt } from '../../../hooks/useInstallPrompt';
import Icon from '../../common/Icon';
import ColorPicker from '../../common/ColorPicker';
import * as C from './styles';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  CreditCard,
  PiggyBank,
  CalendarClock,
  Settings,
  LogOut,
  Download,
  ChevronRight,
} from 'lucide-react';

/** Itens de navegação com ícone */
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/transactions', label: 'Transações', Icon: Receipt },
  { path: '/analysis', label: 'Análise', Icon: BarChart3 },
  { path: '/installments', label: 'Parcelados & Dívidas', Icon: CreditCard },
  { path: '/emergency-reserve', label: 'Reserva', Icon: PiggyBank },
  { path: '/future-expenses', label: 'Gastos Futuros', Icon: CalendarClock },
  { path: '/settings', label: 'Configurações', Icon: Settings },
] as const;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { themeType, toggleTheme } = useTheme();
  const { isInstallable, install } = useInstallPrompt();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeMenu();
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, closeMenu]);

  // Fecha drawer ao trocar de rota (navegação)
  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <C.Container>
      <C.LeftSection>
        <C.MenuButton ref={buttonRef} onClick={toggleMenu} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>
          <Icon size={22}>
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </Icon>
        </C.MenuButton>

        <C.Logo to="/dashboard" onClick={closeMenu}>
          <C.LogoIcon>
            <Icon size={18} color="white">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </Icon>
          </C.LogoIcon>
          <C.LogoText>Finanças</C.LogoText>
        </C.Logo>

        <C.NavLinks>
          {NAV_ITEMS.map(({ path, label }) => (
            <C.NavLink key={path} to={path} $active={isActive(path)} aria-current={isActive(path) ? 'page' : undefined}>
              {label}
            </C.NavLink>
          ))}
        </C.NavLinks>
      </C.LeftSection>

      <C.RightSection>
        {isInstallable && (
          <C.InstallButton onClick={install} title="Instalar app no celular">
            <Icon size={16}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </Icon>
            Instalar
          </C.InstallButton>
        )}
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

      <C.MobileOverlay $isOpen={menuOpen} onClick={closeMenu} aria-hidden={!menuOpen} />
      <C.MobileMenu ref={menuRef as any} $isOpen={menuOpen} role="dialog" aria-modal="true" aria-label="Menu de navegação">
        <C.DrawerHeader>
          <C.DrawerHeaderLeft>
            <C.DrawerLogoIcon>
              <Icon size={18} color="white">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </Icon>
            </C.DrawerLogoIcon>
            <C.DrawerLogoText>Finanças</C.DrawerLogoText>
          </C.DrawerHeaderLeft>
          <C.CloseButton onClick={closeMenu} aria-label="Fechar menu">
            <Icon size={20}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </Icon>
          </C.CloseButton>
        </C.DrawerHeader>

        {user && (
          <C.DrawerUserCard>
            <C.DrawerAvatar>
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
            </C.DrawerAvatar>
            <C.DrawerUserInfo>
              <C.DrawerUserName title={user.name}>{user.name}</C.DrawerUserName>
              <C.DrawerUserEmail title={user.email}>{user.email}</C.DrawerUserEmail>
            </C.DrawerUserInfo>
          </C.DrawerUserCard>
        )}

        <C.DrawerContent>
          <C.DrawerSection>
            <C.DrawerLabel>Navegação</C.DrawerLabel>
            {NAV_ITEMS.map(({ path, label, Icon: ItemIcon }) => {
              const active = isActive(path);
              return (
                <C.MobileNavLink key={path} to={path} $active={active} onClick={closeMenu} aria-current={active ? 'page' : undefined}>
                  <ItemIcon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <ChevronRight size={16} style={{ opacity: active ? 0.9 : 0.35 }} />
                </C.MobileNavLink>
              );
            })}
          </C.DrawerSection>

          <C.DrawerDivider />

          <C.DrawerSection>
            <C.DrawerLabel>Ações</C.DrawerLabel>
            {isInstallable && (
              <C.DrawerInstallButton onClick={() => { closeMenu(); install(); }}>
                <Download size={18} />
                Instalar App
              </C.DrawerInstallButton>
            )}
            <C.DrawerLogout
              onClick={() => {
                closeMenu();
                logout();
              }}
            >
              <LogOut size={18} />
              Sair da conta
            </C.DrawerLogout>
          </C.DrawerSection>
        </C.DrawerContent>

        <C.DrawerFooter>
          <span style={{ fontSize: '11px', color: 'var(--color-textSecondary, #64748b)', textAlign: 'center', lineHeight: 1.4 }}>
            Toque fora ou pressione ESC para fechar
          </span>
        </C.DrawerFooter>
      </C.MobileMenu>
    </C.Container>
  );
};

export default Header;
