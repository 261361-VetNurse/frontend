import React from 'react';
import { FormFieldContainer, Label, InputContainer, ErrorMessage } from '@/styles/formStyled/FormField.styles';

interface FormFieldProps {
  label: React.ReactNode;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField = ({ label, htmlFor, error, children }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
