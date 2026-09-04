/**
 * @file components/common/Select/index.tsx
 * @description Componente de select reutilizável com validação.
 * Suporta opções dinâmicas, placeholder e mensagens de erro.
 */

import React, { forwardRef } from 'react';
import Icon from '../Icon';
import * as C from './styles';

/** Interface para opções do select */
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Props do componente Select */
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
    /** ID único do select */
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

          <C.ArrowIcon>
            <Icon size={16}>
              <polyline points="6 9 12 15 18 9" />
            </Icon>
          </C.ArrowIcon>
        </C.SelectWrapper>

        {error && <C.ErrorMessage role="alert">{error}</C.ErrorMessage>}
      </C.Container>
    );
  }
);

Select.displayName = 'Select';

export default Select;
