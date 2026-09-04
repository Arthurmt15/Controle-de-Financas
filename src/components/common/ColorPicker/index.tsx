/**
 * @file components/common/ColorPicker/index.tsx
 * @description Componente de seleção de cor de destaque.
 * Permite ao usuário escolher entre diferentes paletas de cores.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, AccentColor, ACCENT_COLORS } from '../../../contexts/ThemeContext';
import styled from 'styled-components';

/** Container do seletor de cores */
const PickerContainer = styled.div`
  position: relative;
`;

/** Botão do seletor de cores */
const PickerButton = styled.button`
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

/** Dropdown com as opções de cores */
const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px;
  min-width: 180px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

/** Título do dropdown */
const DropdownTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/** Grid de cores */
const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

/** Botão de cor individual */
const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid ${({ $isSelected, theme }) => ($isSelected ? theme.colors.text : 'transparent')};
  background: ${({ $color }) => $color};
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

/** Nome da cor selecionada */
const ColorName = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

/** Lista de cores disponíveis */
const COLOR_OPTIONS: AccentColor[] = ['indigo', 'purple', 'blue', 'green', 'orange', 'pink', 'red'];

/** Nomes das cores em português */
const COLOR_NAMES: Record<AccentColor, string> = {
  indigo: 'Indigo',
  purple: 'Roxo',
  blue: 'Azul',
  green: 'Verde',
  orange: 'Laranja',
  pink: 'Rosa',
  red: 'Vermelho',
};

/**
 * Componente ColorPicker
 * Exibe um botão que abre dropdown com opções de cores
 */
const ColorPicker: React.FC = () => {
  const { accentColor, setAccentColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Fecha o dropdown ao clicar fora */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <PickerContainer ref={containerRef}>
      <PickerButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mudar cor do tema"
        title="Personalizar cor"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="19" cy="11.5" r="2.5" />
          <circle cx="6" cy="12.5" r="2.5" />
          <circle cx="12" cy="19.5" r="2.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
      </PickerButton>

      <Dropdown $isOpen={isOpen}>
        <DropdownTitle>Cor de destaque</DropdownTitle>
        <ColorGrid>
          {COLOR_OPTIONS.map((color) => (
            <ColorOption
              key={color}
              $color={ACCENT_COLORS[color].primary}
              $isSelected={accentColor === color}
              onClick={() => {
                setAccentColor(color);
                setIsOpen(false);
              }}
              aria-label={`Cor ${COLOR_NAMES[color]}`}
              title={COLOR_NAMES[color]}
            />
          ))}
        </ColorGrid>
        <ColorName>{COLOR_NAMES[accentColor]}</ColorName>
      </Dropdown>
    </PickerContainer>
  );
};

export default ColorPicker;
