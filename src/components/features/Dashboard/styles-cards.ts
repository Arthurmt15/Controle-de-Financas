import styled from 'styled-components';

export const SummaryGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px;
  @media (max-width: 1150px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

export const SummaryCard = styled.div<{ $tone?: 'emerald' | 'rose' | 'violet' | 'slate' }>`
  position: relative; min-height: 118px; display: flex; align-items: center; gap: 14px;
  padding: 18px; border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.type === 'dark' ? 'rgba(14,18,32,0.9)' : '#ffffff'};
  box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06);
  overflow: hidden; transition: transform 0.18s, box-shadow 0.18s;
  &::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:${({ $tone }) => $tone === 'emerald' ? 'linear-gradient(180deg,#10b981,#06b6d4)' : $tone === 'rose' ? 'linear-gradient(180deg,#f43f5e,#f97316)' : $tone === 'violet' ? 'linear-gradient(180deg,#8b5cf6,#6366f1)' : 'linear-gradient(180deg,#64748b,#475569)'};opacity:0.9}
  &:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(15,23,42,0.08)}
`;

export const SummaryIcon = styled.div<{ $tone?: string; $variant?: string }>`
  width: 42px; height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 12px; border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $tone, theme }) => $tone === 'emerald' ? '#ecfdf5' : $tone === 'rose' ? '#fff1f2' : $tone === 'violet' ? '#f5f3ff' : theme.colors.surfaceHover};
  color: ${({ $tone }) => $tone === 'emerald' ? '#059669' : $tone === 'rose' ? '#e11d48' : $tone === 'violet' ? '#7c3aed' : '#64748b'};
  .dark &{background:${({ $tone }) => $tone === 'emerald' ? 'rgba(16,185,129,0.12)' : $tone === 'rose' ? 'rgba(244,63,94,0.12)' : $tone === 'violet' ? 'rgba(139,92,246,0.12)' : 'rgba(100,116,139,0.12)'};border-color:transparent}
`;

export const SummaryLabel = styled.span`display:block;color:${({theme})=>theme.colors.textSecondary};font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase`;
export const SummaryValue = styled.strong`display:block;margin-top:6px;font-size:19px;font-weight:700;letter-spacing:-0.02em;color:${({theme})=>theme.colors.text}`;
export const SummarySubtext = styled.small<{ $tone?: string }>`
  display:block;margin-top:6px;font-size:11px;font-weight:500;
  color:${({ $tone }) => $tone === 'emerald' ? '#059669' : $tone === 'rose' ? '#e11d48' : $tone === 'violet' ? '#7c3aed' : '#64748b'};
  background:${({ $tone }) => $tone ? ($tone === 'emerald' ? '#ecfdf5' : $tone === 'rose' ? '#fff1f2' : $tone === 'violet' ? '#f5f3ff' : '#f1f5f9') : 'transparent'};
  padding:${({ $tone }) => $tone ? '2px 6px' : '0'};border-radius:999px;display:inline-block;
`;

export const DotsButton = styled.button`
  position:absolute;right:10px;top:10px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;
  border:1px solid transparent;border-radius:999px;background:transparent;color:${({theme})=>theme.colors.textSecondary};cursor:pointer;
  &:hover{background:${({theme})=>theme.colors.surfaceHover};border-color:${({theme})=>theme.colors.border}}
`;
