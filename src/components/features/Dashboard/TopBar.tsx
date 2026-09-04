/**
 * @file components/features/Dashboard/TopBar.tsx
 * @description Componente de barra superior do Dashboard.
 * Contém botão de tema e perfil do usuário.
 */

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import * as C from './styles';

/**
 * Componente TopBar
 * Exibe barra superior com toggle de tema e perfil do usuário
 */
const TopBar: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();

  return (
    <C.TopBar>
      {/* Ações do topo */}
      <C.TopActions>
        <C.ThemeButton onClick={toggleTheme} title="Alternar tema">
          {themeType === 'dark' ? '☀️' : '🌙'}
        </C.ThemeButton>
      </C.TopActions>

      {/* Perfil do usuário */}
      <C.Profile>
        <C.Avatar>JD</C.Avatar>
        <C.ProfileInfo>
          <strong>João Doe</strong>
          <small>joao@email.com</small>
        </C.ProfileInfo>
        <C.Chevron>›</C.Chevron>
      </C.Profile>
    </C.TopBar>
  );
};

export default TopBar;
