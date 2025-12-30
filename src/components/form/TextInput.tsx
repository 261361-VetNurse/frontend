import React, { forwardRef } from 'react';
import { StyledInput } from '@/styles/formStyled/TextInput.styles';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <StyledInput
        ref={ref}
        $error={error}
        className={className}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
