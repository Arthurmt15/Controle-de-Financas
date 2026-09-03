/**
 * @file components/common/Input/index.tsx
 * @description Componente de input reutilizável com validação e labels.
 * Suporta diferentes tipos, estados de erro e textos de ajuda.
 */

import React, { forwardRef } from 'react';
import * as C from './styles';
import type { InputProps } from '../../../types';

/**
 * Componente Input reutilizável
 * Utiliza forwardRef para permitir referência externa
 * @param {InputProps} props - Props do componente
 * @param {React.Ref} ref - Ref para o elemento input
 * @returns {JSX.Element} Componente Input renderizado
 *
 * @example
 * // Input básico
 * <Input
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   label="Nome"
 *   placeholder="Digite seu nome"
 * />
 *
 * @example
 * // Input com erro
 * <Input
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   label="Email"
 *   type="email"
 *   error="Email inválido"
 * />
 *
 * @example
 * // Input number
 * <Input
 *   value={amount}
 *   onChange={(e) => setAmount(e.target.value)}
 *   label="Valor"
 *   type="number"
 *   placeholder="0,00"
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder,
      type = 'text',
      disabled = false,
      required = false,
      error,
      helperText,
      name,
      inputId,
      className,
      id,
      style,
    },
    ref
  ) => {
    // Gera um ID único se não fornecido
    const inputIdGenerated = inputId || `input-${name || label?.toLowerCase().replace(/\s/g, '-')}`;

    return (
      <C.Container className={className} id={id} style={style}>
        {/* Label do input */}
        {label && (
          <C.Label
            htmlFor={inputIdGenerated}
            hasError={!!error}
            isRequired={required}
            isDisabled={disabled}
          >
            {label}
            {required && <C.Required aria-hidden="true">*</C.Required>}
          </C.Label>
        )}

        {/* Wrapper do input para posicionar ícones */}
        <C.InputWrapper hasError={!!error} isDisabled={disabled}>
          <C.StyledInput
            ref={ref}
            id={inputIdGenerated}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            hasError={!!error}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputIdGenerated}-error` : helperText ? `${inputIdGenerated}-helper` : undefined
            }
          />
        </C.InputWrapper>

        {/* Mensagem de erro */}
        {error && (
          <C.ErrorMessage id={`${inputIdGenerated}-error`} role="alert">
            {error}
          </C.ErrorMessage>
        )}

        {/* Texto de ajuda (quando não há erro) */}
        {helperText && !error && (
          <C.HelperText id={`${inputIdGenerated}-helper`}>{helperText}</C.HelperText>
        )}
      </C.Container>
    );
  }
);

// Define display name para debugging
Input.displayName = 'Input';

export default Input;
