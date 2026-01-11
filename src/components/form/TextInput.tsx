"use client";

import React, { forwardRef, useEffect, useRef } from 'react';
import { StyledInput,StyledTextArea } from '@/styles/formStyled/TextInput.styles';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md';
  rows?: 3 | 5 | 8;
  autoGrow?: boolean;
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

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, size = 'md', rows = 3, autoGrow = false, error, disabled, readOnly, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (el: HTMLTextAreaElement) => {
      innerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    useEffect(() => {
      if (autoGrow && innerRef.current) {
        const textarea = innerRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    }, [props.value, autoGrow]);

    return (
      <StyledTextArea
        ref={setRefs}
        className={className}
        rows={rows}
        $size={size}
        $error={error}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
TextArea.displayName = 'TextArea';