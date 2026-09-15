import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Container = styled.header`
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px;
  background: ${({ theme }) => theme.type === 'dark' ? 'rgba(17,26,51,0.78)' : 'rgba(255,255,255,0.82)'};
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.type === 'dark'
    ? '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)'
    : '0 1px 0 rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)'};
  &::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#6366f1 20%,#06b6d4 50%,#8b5cf6 80%,transparent);opacity:${({ theme }) => theme.type === 'dark' ? 0.45 : 0.6}}
  @media (max-width:640px){padding:8px 12px}
`;

export const LeftSection = styled.div`display:flex;align-items:center;gap:12px;min-width:0`;
export const NavLinks = styled.nav`display:flex;align-items:center;gap:2px;margin-left:20px;@media(max-width:768px){display:none}`;
export const NavLink = styled(Link)`
  font-size:13px;font-weight:500;letter-spacing:-0.01em;
  color:${({theme})=>theme.colors.textSecondary};text-decoration:none;
  padding:7px 12px;border-radius:999px;transition:all 0.18s ease;
  &:hover{color:${({theme})=>theme.colors.text};background:${({theme})=>theme.colors.surfaceHover}}
  &[aria-current="page"]{background: ${({theme})=>theme.colors.primary};color:white;box-shadow:0 2px 8px rgba(99,102,241,0.25)}
`;

export const MenuButton = styled.button`
  display:none;align-items:center;justify-content:center;width:40px;height:40px;
  border:none;border-radius:10px;background:transparent;color:${({theme})=>theme.colors.primary};cursor:pointer;
  &:hover{background:${({theme})=> theme.type === 'dark' ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}} @media(max-width:768px){display:flex}
`;

export const Logo = styled(Link)`display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0`;
export const LogoIcon = styled.div`
  width:34px;height:34px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#6366f1 0%,#06b6d4 45%,#8b5cf6 100%);
  color:white;border-radius:10px;box-shadow:0 4px 12px rgba(99,102,241,0.25),inset 0 1px 0 rgba(255,255,255,0.2);
  svg{color:white} @media(max-width:640px){width:30px;height:30px}
`;
export const LogoText = styled.span`
  font-size:19px;font-weight:700;letter-spacing:-0.03em;color:${({theme})=>theme.colors.text};
  font-family:'Geist','Inter',system-ui,sans-serif;
  span{font-weight:400;color:${({theme})=>theme.colors.textSecondary}}
  @media(max-width:480px){display:none}
`;

export const RightSection = styled.div`display:flex;align-items:center;gap:8px;flex-shrink:0;@media(max-width:640px){gap:4px}`;
export const InstallButton = styled.button`
  display:flex;align-items:center;gap:6px;padding:8px 14px;border:none;border-radius:999px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:13px;font-weight:600;cursor:pointer;
  box-shadow:0 2px 8px rgba(99,102,241,0.25);transition:transform 0.15s,opacity 0.15s;
  &:hover{opacity:0.9;transform:translateY(-1px)}&:active{transform:none}
  @media(max-width:640px){padding:6px 10px;font-size:12px}
`;

export const ThemeToggle = styled.button`
  width:36px;height:36px;display:flex;align-items:center;justify-content:center;
  border:1px solid ${({theme})=>theme.colors.border};border-radius:999px;
  background:${({theme})=>theme.colors.surface};color:${({theme})=>theme.colors.textSecondary};cursor:pointer;
  transition:all 0.18s;
  &:hover{border-color:${({theme})=>theme.colors.primary};color:${({theme})=>theme.colors.primary};transform:rotate(15deg)}
  @media(max-width:640px){width:32px;height:32px}
`;

export const UserSection = styled.div`
  display:flex;align-items:center;gap:10px;padding:4px 4px 4px 10px;
  border:1px solid ${({theme})=>theme.colors.border};border-radius:999px;
  background:${({theme})=>theme.colors.surface};
  @media(max-width:600px){display:none}
`;
export const UserAvatar = styled.div`
  width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:white;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0;
  box-shadow:0 2px 8px rgba(99,102,241,0.25);img{width:100%;height:100%;object-fit:cover;border-radius:50%}
`;
export const UserInfo = styled.div`display:flex;flex-direction:column;line-height:1.1;@media(max-width:768px){display:none}`;
export const UserName = styled.span`font-size:13px;font-weight:600;color:${({theme})=>theme.colors.text};letter-spacing:-0.01em`;
export const UserEmail = styled.span`font-size:11px;color:${({theme})=>theme.colors.textSecondary}`;

export const LogoutButton = styled.button`
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  border:none;border-radius:50%;background:transparent;color:${({theme})=>theme.colors.textSecondary};cursor:pointer;
  &:hover{background:${({theme})=>theme.type === 'dark' ? 'rgba(248,113,113,0.12)' : 'rgba(220,38,38,0.08)'};color:${({theme})=>theme.colors.error}}
`;

export const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  display:none;@media(max-width:768px){
    display:${({$isOpen})=>($isOpen?'block':'none')};position:fixed;inset:0;
    background:rgba(2,6,23,0.45);backdrop-filter:blur(8px);z-index:200;
  }
`;
export const MobileMenu = styled.nav<{ $isOpen: boolean }>`
  display:none;@media(max-width:768px){
    display:flex;flex-direction:column;position:fixed;top:0;left:0;width:300px;max-width:85vw;height:100vh;height:100dvh;
    background:${({theme})=>theme.colors.surface};border-right:1px solid ${({theme})=>theme.colors.border};
    z-index:201;padding:16px;gap:4px;transform:translateX(${({$isOpen})=>($isOpen?'0':'-100%')});transition:transform 0.28s cubic-bezier(0.32,0.72,0,1);
    box-shadow:${({theme})=> theme.type === 'dark' ? '16px 0 40px rgba(0,0,0,0.45)' : '16px 0 40px rgba(0,0,0,0.12)'};
  }
`;
export const MobileNavLink = styled(Link)`
  display:flex;align-items:center;gap:12px;padding:12px 14px;font-size:14px;font-weight:500;
  color:${({theme})=>theme.colors.textSecondary};text-decoration:none;border-radius:10px;transition:all 0.15s;
  &:hover{color:${({theme})=>theme.colors.primary};background:${({theme})=>theme.colors.surfaceHover}}
`;
export const CloseButton = styled.button`
  display:flex;align-items:center;justify-content:center;width:36px;height:36px;
  border:none;border-radius:10px;background:transparent;color:${({theme})=>theme.colors.textSecondary};cursor:pointer;
  align-self:flex-end;margin-bottom:8px; &:hover{background:${({theme})=>theme.colors.surfaceHover}}
`;
