/**
 * @file components/common/SoundToggle/index.tsx
 * @description Alterna os efeitos sonoros do app direto no cabeçalho.
 */

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import styled from 'styled-components';
import { isSoundEnabled, setSoundEnabled, playSound } from '../../../utils/sounds';

const Toggle = styled.button<{ $enabled: boolean }>`
  width: 38px;
  height: 38px;
  min-width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ $enabled, theme }) => ($enabled ? theme.colors.primary : theme.colors.textSecondary)};
  cursor: pointer;
  transition: all 0.18s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
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

const SoundToggle: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(() => isSoundEnabled());

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playSound('success', { force: true });
  };

  return (
    <Toggle
      type="button"
      $enabled={enabled}
      onClick={handleToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Desativar sons' : 'Ativar sons'}
      title={enabled ? 'Desativar sons' : 'Ativar sons'}
    >
      {enabled ? <Volume2 size={18} strokeWidth={1.8} /> : <VolumeX size={18} strokeWidth={1.8} />}
    </Toggle>
  );
};

export default SoundToggle;
