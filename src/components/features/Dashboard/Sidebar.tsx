/**
 * @file components/features/Dashboard/Sidebar.tsx
 * @description Componente de sidebar do Dashboard.
 * Contém navegação, card de upgrade e controle de tema.
 */

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import * as C from './styles';

/** Props do componente Sidebar */
interface SidebarProps {
  /** Rota ativa atualmente */
  activeRoute?: string;
}

/**
 * Componente Sidebar
 * Exibe navegação lateral, branding e controle de tema
 * @param {SidebarProps} props - Props do componente
 */
const Sidebar: React.FC<SidebarProps> = ({ activeRoute = '/dashboard' }) => {
  const { themeType, toggleTheme } = useTheme();

  /**
   * Verifica se a rota está ativa
   * @param {string} route - Rota a ser verificada
   * @returns {boolean} True se for a rota ativa
   */
  const isActive = (route: string): boolean => activeRoute === route;

  return (
    <C.Sidebar>
      {/* Branding */}
      <C.Brand>
        <C.BrandLogo>F</C.BrandLogo>
        <strong>FinanceFlow</strong>
      </C.Brand>

      {/* Navegação */}
      <C.Navigation>
        <C.NavItem href="/dashboard" $active={isActive('/dashboard')}>
          <span>📊</span>
          Dashboard
        </C.NavItem>
        <C.NavItem href="/transactions" $active={isActive('/transactions')}>
          <span>💳</span>
          Transações
        </C.NavItem>
        <C.NavItem href="/reports" $active={isActive('/reports')}>
          <span>📈</span>
          Relatórios
        </C.NavItem>
        <C.NavItem href="/settings" $active={isActive('/settings')}>
          <span>⚙️</span>
          Configurações
        </C.NavItem>
      </C.Navigation>

      {/* Parte inferior */}
      <C.SidebarBottom>
        <C.UpgradeCard>
          <C.UpgradeTitle>Upgrade para Pro</C.UpgradeTitle>
          <C.UpgradeText>
            Acesse relatórios avançados, exportação em PDF e muito mais.
          </C.UpgradeText>
          <C.UpgradeButton>Upgrade Agora</C.UpgradeButton>
        </C.UpgradeCard>

        <C.ThemeControl>
          <span>🌙 Modo Escuro</span>
          <C.Switch $active={themeType === 'dark'} onClick={toggleTheme}>
            <span />
          </C.Switch>
        </C.ThemeControl>
      </C.SidebarBottom>
    </C.Sidebar>
  );
};

export default Sidebar;
