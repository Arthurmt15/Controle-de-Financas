import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Container = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100vw;
  height: 56px;
  padding: 0 16px;
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  background: ${({ theme }) => (theme.type === 'dark' ? 'rgba(17,26,51,0.85)' : 'rgba(255,255,255,0.88)')};
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) =>
    theme.type === 'dark'
      ? '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)'
      : '0 1px 0 rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)'};
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      #6366f1 20%,
      #06b6d4 50%,
      #8b5cf6 80%,
      transparent
    );
    opacity: ${({ theme }) => (theme.type === 'dark' ? 0.45 : 0.6)};
  }
  @media (max-width: 640px) {
    height: 52px;
    padding: 0 12px;
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;
export const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 16px;
  flex-wrap: nowrap;
  @media (max-width: 1100px) {
    display: none;
  }
`;
export const NavLink = styled(Link)<{ $active?: boolean }>`
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: ${({ theme, $active }) => ($active ? 'white' : theme.colors.textSecondary)};
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 999px;
  transition: all 0.18s ease;
  background: ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 2px 8px rgba(99,102,241,0.25)' : 'none')};
  &:hover {
    color: ${({ theme, $active }) => ($active ? 'white' : theme.colors.text)};
    background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surfaceHover)};
  }
`;

export const MenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => (theme.type === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)')};
    border-color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)')};
  }
  &:active {
    transform: scale(0.96);
  }
  @media (max-width: 1100px) {
    display: flex;
  }
  @media (max-width: 640px) {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }
`;

export const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
  min-width: 0;
`;
export const LogoIcon = styled.div`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #06b6d4 45%, #8b5cf6 100%);
  color: white;
  border-radius: 10px;
  box-shadow:
    0 4px 12px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  svg {
    color: white;
  }
  @media (max-width: 640px) {
    width: 30px;
    height: 30px;
    border-radius: 9px;
  }
`;
export const LogoText = styled.span`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Geist', 'Inter', system-ui, sans-serif;
  white-space: nowrap;
  span {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  @media (max-width: 480px) {
    display: none;
  }
  @media (max-width: 1100px) and (min-width: 481px) {
    font-size: 17px;
  }
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
  @media (max-width: 640px) {
    gap: 6px;
  }
  @media (max-width: 380px) {
    gap: 4px;
  }
`;
export const InstallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
  transition:
    transform 0.15s,
    opacity 0.15s;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  &:active {
    transform: none;
  }
  @media (max-width: 640px) {
    padding: 7px 12px;
    font-size: 12px;
  }
  @media (max-width: 480px) {
    display: none;
  }
`;

export const ThemeToggle = styled.button`
  width: 38px;
  height: 38px;
  min-width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.18s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: rotate(15deg);
  }
  @media (max-width: 640px) {
    width: 34px;
    height: 34px;
    min-width: 34px;
  }
  @media (max-width: 380px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 4px 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  max-width: 220px;
  @media (max-width: 1100px) {
    display: none;
  }
`;
export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;
export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  @media (max-width: 768px) {
    display: none;
  }
`;
export const UserName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.01em;
`;
export const UserEmail = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const LogoutButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => (theme.type === 'dark' ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)')};
    color: ${({ theme }) => theme.colors.error};
  }
`;

export const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  @media (max-width: 1100px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.48);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 200;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
    transition: opacity 0.24s ease;
  }
`;
export const MobileMenu = styled.nav<{ $isOpen: boolean }>`
  display: none;
  @media (max-width: 1100px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 340px;
    max-width: min(88vw, 360px);
    height: 100vh;
    height: 100dvh;
    background: ${({ theme }) => theme.colors.surface};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    z-index: 201;
    transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
    transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: ${({ theme }) => (theme.type === 'dark' ? '16px 0 50px rgba(0,0,0,0.5), 8px 0 24px rgba(0,0,0,0.35)' : '16px 0 50px rgba(15,23,42,0.12), 8px 0 24px rgba(15,23,42,0.08)')};
    overflow: hidden;
  }
  @media (max-width: 380px) {
    width: 100vw;
    max-width: 100vw;
  }
`;
export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px 16px;
  padding-top: max(14px, env(safe-area-inset-top));
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  gap: 12px;
`;
export const DrawerHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;
export const DrawerLogoIcon = styled.div`
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #06b6d4 45%, #8b5cf6 100%);
  color: white;
  border-radius: 10px;
  box-shadow:
    0 4px 12px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  svg {
    color: white;
  }
`;
export const DrawerLogoText = styled.span`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Geist', 'Inter', system-ui, sans-serif;
`;
export const DrawerUserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px 0 16px;
  padding: 12px;
  background: ${({ theme }) => (theme.type === 'dark' ? 'rgba(99,102,241,0.08)' : '#f8fafc')};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
`;
export const DrawerAvatar = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
export const DrawerUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;
export const DrawerUserName = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const DrawerUserEmail = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 12px 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 999px;
  }
`;
export const DrawerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
export const DrawerLabel = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px 10px 2px 10px;
`;
export const DrawerDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 0 12px;
`;
export const MobileNavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textSecondary)};
  background: ${({ theme, $active }) => ($active ? (theme.type === 'dark' ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)') : 'transparent')};
  border: ${({ theme, $active }) => ($active ? `1px solid ${theme.type === 'dark' ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.14)'}` : '1px solid transparent')};
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.15s;
  min-height: 44px;
  svg {
    flex-shrink: 0;
    opacity: ${({ $active }) => ($active ? 1 : 0.85)};
  }
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme, $active }) => ($active ? (theme.type === 'dark' ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)') : theme.colors.surfaceHover)};
    transform: translateX(1px);
  }
  &:active {
    transform: scale(0.99);
  }
`;
export const DrawerFooter = styled.div`
  padding: 12px 12px max(12px, env(safe-area-inset-bottom)) 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.surface};
`;
export const DrawerLogout = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  min-height: 44px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => (theme.type === 'dark' ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)')};
    color: ${({ theme }) => theme.colors.error};
    border-color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(248,113,113,0.22)' : 'rgba(220,38,38,0.14)')};
  }
`;
export const DrawerInstallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  min-height: 44px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.25);
  transition: all 0.15s;
  &:hover {
    opacity: 0.94;
    transform: translateY(-1px);
  }
  &:active {
    transform: none;
  }
`;
export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};
  }
  &:active {
    transform: scale(0.96);
  }
`;
