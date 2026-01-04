import React, { forwardRef } from 'react';
import { SelectWrapper, StyledSelect, Chevron } from '@/styles/formStyled/SelectInput.styles';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ className, options, placeholder, error, children, ...props }, ref) => {
    return (
      <SelectWrapper>
        <StyledSelect
          ref={ref}
          $error={error}
          className={className}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </StyledSelect>
        <Chevron>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Chevron>
      </SelectWrapper>
    );
  }
);

SelectInput.displayName = 'SelectInput';
