/**
 * @file components/common/Button/index.tsx
 * @description Componente de botão reutilizável com variantes visuais.
 * Suporta diferentes tamanhos, variantes, estados e ícones.
 */

import React from 'react';
import * as C from './styles';
import type { ButtonProps } from '../../../types';

/**
 * Componente Button reutilizável
 * @param {ButtonProps} props - Props do componente
 * @returns {JSX.Element} Componente Button renderizado
 *
 * @example
 * // Botão primário básico
 * <Button onClick={handleClick}>Clique aqui</Button>
 *
 * @example
 * // Botão de perigo com ícone
 * <Button variant="danger" leftIcon={<FaTrash />} onClick={handleDelete}>
 *   Excluir
 * </Button>
 *
 * @example
 * // Botão carregando
 * <Button isLoading>Salvando...</Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className,
  id,
  style,
}) => {
  /**
   * Lida com o clique no botão
   * Impede ação quando desabilitado ou carregando
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <C.Container
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      onClick={handleClick}
      type={type}
      className={className}
      id={id}
      style={style}
      // Acessibilidade
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {/* Indicador de carregamento */}
      {isLoading && (
        <C.Spinner aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="10"
            />
          </svg>
        </C.Spinner>
      )}

      {/* Ícone esquerdo */}
      {!isLoading && leftIcon && (
        <C.IconWrapper position="left" aria-hidden="true">
          {leftIcon}
        </C.IconWrapper>
      )}

      {/* Texto do botão */}
      <C.Text>{children}</C.Text>

      {/* Ícone direito */}
      {rightIcon && (
        <C.IconWrapper position="right" aria-hidden="true">
          {rightIcon}
        </C.IconWrapper>
      )}
    </C.Container>
  );
};

export default Button;
