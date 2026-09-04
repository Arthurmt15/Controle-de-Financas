/**
 * @file components/features/Dashboard/styles-layout.ts
 * @description Estilos de layout do Dashboard (sidebar, topbar, conteúdo).
 */

import styled from 'styled-components';

/** Container principal do layout do dashboard */
export const AppLayout = styled.div`
  min-height: 100vh;
  display: flex;
  background: radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.07), transparent 35%),
    ${({ theme }) => theme.colors.background};
`;

/** Container da sidebar lateral */
export const Sidebar = styled.aside`
  width: 280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 22px 18px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(180deg, #090f1d, #070c18);
  flex-shrink: 0;

  @media (max-width: 850px) {
    width: 72px;
    padding: 20px 10px;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

/** Container da marca/logo na sidebar */
export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 6px 30px;
  font-size: 20px;

  @media (max-width: 850px) {
    justify-content: center;
    padding-bottom: 25px;
  }
`;

/** Ícone da logo com gradiente roxo */
export const BrandLogo = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: linear-gradient(145deg, #6547ef, #8b5cf6);
  box-shadow: 0 0 25px rgba(112, 72, 237, 0.28);
  font-size: 24px;
  font-weight: 700;
`;

/** Container da navegação lateral */
export const Navigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

/** Item de navegação individual */
export const NavItem = styled.a<{ $active?: boolean }>`
  height: 44px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 15px;
  border-radius: 8px;
  color: ${({ $active }) => ($active ? 'white' : '#aeb8c9')};
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s;
  background: ${({ $active }) =>
    $active ? 'linear-gradient(90deg, rgba(112, 72, 237, 0.22), rgba(112, 72, 237, 0.08))' : 'transparent'};

  span {
    width: 18px;
    text-align: center;
    font-size: 18px;
    color: ${({ $active }) => ($active ? '#9b7cff' : 'inherit')};
  }

  &:hover {
    color: white;
    background: linear-gradient(90deg, rgba(112, 72, 237, 0.22), rgba(112, 72, 237, 0.08));
  }

  @media (max-width: 850px) {
    font-size: 0;
    justify-content: center;
    padding: 0;
    span { font-size: 19px; }
  }
`;

/** Container inferior da sidebar */
export const SidebarBottom = styled.div`
  margin-top: auto;
`;

/** Container do conteúdo principal */
export const MainContent = styled.main`
  min-width: 0;
  flex: 1;
`;

/** Barra superior do dashboard */
export const TopBar = styled.header`
  height: 67px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

/** Container de ações do topo */
export const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

/** Botão de tema no topo */
export const ThemeButton = styled.button`
  width: 45px;
  height: 45px;
  border: 0;
  border-radius: 12px;
  background: #151d2c;
  color: white;
  font-size: 22px;
  cursor: pointer;

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
  }
`;

/** Perfil do usuário no topo */
export const Profile = styled.div`
  min-width: 235px;
  height: 51px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 11px;
  border-radius: 9px;
  background: #151c2b;

  @media (max-width: 600px) {
    min-width: 0;
    width: 45px;
    padding: 4px;
    justify-content: center;
  }
`;

/** Avatar do usuário */
export const Avatar = styled.div`
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #777, #222);
  font-weight: 700;
`;

/** Informações do perfil */
export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  strong { font-size: 12px; }
  small { margin-top: 3px; color: #8f9aae; font-size: 10px; }
  @media (max-width: 600px) { display: none; }
`;

/** Ícone de chevron no perfil */
export const Chevron = styled.span`
  color: #8e99ab;
  @media (max-width: 600px) { display: none; }
`;

/** Container do conteúdo central */
export const Content = styled.div`
  width: min(1320px, calc(100% - 56px));
  margin: 0 auto;
  padding: 27px 0 45px;

  @media (max-width: 1150px) { width: calc(100% - 36px); }
  @media (max-width: 600px) { width: calc(100% - 28px); padding-top: 22px; }
`;

/** Cabeçalho da página */
export const PageHeading = styled.div`
  margin-bottom: 24px;
  h1 { font-size: 27px; letter-spacing: -0.6px; }
  p { margin-top: 6px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 13px; }
  @media (max-width: 600px) { h1 { font-size: 24px; } }
`;

/** Card de upgrade na sidebar */
export const UpgradeCard = styled.div`
  padding: 20px 16px 16px;
  margin: 20px 4px 25px;
  border: 1px solid rgba(130, 91, 255, 0.25);
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(99, 68, 205, 0.18), rgba(48, 32, 107, 0.18));
  @media (max-width: 850px) { display: none; }
`;

/** Título do card de upgrade */
export const UpgradeTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
`;

/** Parágrafo de descrição do upgrade */
export const UpgradeText = styled.p`
  margin: 13px 0 17px;
  color: #9ca8bb;
  font-size: 12px;
  line-height: 1.6;
`;

/** Botão de upgrade */
export const UpgradeButton = styled.button`
  width: 100%;
  height: 35px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(90deg, #6741ed, #7b4df2);
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

/** Container de controle de tema na sidebar */
export const ThemeControl = styled.div`
  height: 51px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: #b5bfd0;
  font-size: 12px;
  @media (max-width: 850px) { display: none; }
`;

/** Toggle switch para tema */
export const Switch = styled.button<{ $active?: boolean }>`
  width: 38px;
  height: 22px;
  padding: 3px;
  border-radius: 20px;
  background: ${({ $active }) => ($active ? '#7548ee' : '#313b50')};
  border: none;
  cursor: pointer;

  span {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: 0.2s;
    margin-left: ${({ $active }) => ($active ? '16px' : '0')};
  }
`;
