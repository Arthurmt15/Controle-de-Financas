/**
 * @file components/common/Select/index.tsx
 * @description Componente de select reutilizável com validação.
 * Suporta opções dinâmicas, placeholder e mensagens de erro.
 */

import React, { forwardRef } from 'react';
import * as C from './styles';

/**
 * Props do componente Select
 */
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

/**
 * Componente Select reutilizável
 * @param {SelectProps} props - Props do componente
 * @returns {JSX.Element} Componente Select renderizado
 *
 * @example
 * <Select
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   options={[
 *     { value: '1', label: 'Alimentação' },
 *     { value: '2', label: 'Transporte' },
 *   ]}
 *   label="Categoria"
 *   placeholder="Selecione"
 * />
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      value,
      onChange,
      options,
      label,
      placeholder,
      name,
      disabled = false,
      required = false,
      error,
      className,
    },
    ref
  ) => {
    const selectId = `select-${name || label?.toLowerCase().replace(/\s/g, '-')}`;

    return (
      <C.Container className={className}>
        {label && (
          <C.Label
            htmlFor={selectId}
            hasError={!!error}
            isRequired={required}
            isDisabled={disabled}
          >
            {label}
            {required && <C.Required>*</C.Required>}
          </C.Label>
        )}

        <C.SelectWrapper hasError={!!error} isDisabled={disabled}>
          <C.StyledSelect
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            hasError={!!error}
            aria-invalid={!!error}
          >
            {placeholder && (
              <C.Option value="" disabled>
                {placeholder}
              </C.Option>
            )}
            {options.map((option) => (
              <C.Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </C.Option>
            ))}
          </C.StyledSelect>

          {/* Ícone de seta */}
          <C.ArrowIcon>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </C.ArrowIcon>
        </C.SelectWrapper>

        {error && <C.ErrorMessage role="alert">{error}</C.ErrorMessage>}
      </C.Container>
    );
  }
);

Select.displayName = 'Select';

export default Select;
