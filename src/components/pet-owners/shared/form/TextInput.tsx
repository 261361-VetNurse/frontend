import React, { forwardRef } from 'react';
import { InputWrapper, StyledInput } from '@/styles/components/form/TextInput.styles';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <InputWrapper>
        <StyledInput
          ref={ref}
          $error={error}
          className={className}
          {...props}
        />
      </InputWrapper>
    );
  }
);

TextInput.displayName = 'TextInput';
