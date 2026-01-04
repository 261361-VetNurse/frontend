import React from 'react';
import { FormFieldContainer, Label, InputContainer, ErrorMessage } from '@/styles/formStyled/FormField.styles';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  children,
}) => {
  return (
    <FormFieldContainer>
      <Label htmlFor={htmlFor}>
        {label}
      </Label>
      <InputContainer>
        {children}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputContainer>
    </FormFieldContainer>
  );
};
