import React from 'react';
import { StyledButton, Spinner, SpinnerCircle, ButtonText } from '@/styles/formStyled/PrimaryButton.styles';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'lg' | 'md' | 'sm';
  fullWidth?: boolean;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  size = 'lg',
  fullWidth = true,
  loading = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <StyledButton
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && (
        <Spinner>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <SpinnerCircle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            />
          </svg>
        </Spinner>
      )}
      <ButtonText>{children}</ButtonText>
    </StyledButton>
  );
};
