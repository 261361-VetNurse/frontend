import React from 'react';
import { StyledButton, Spinner, SpinnerCircle, ButtonText } from '@/styles/components/form/PrimaryButton.styles';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'lg' | 'md' | 'sm';
  fullWidth?: boolean;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  size = 'md',
  fullWidth = true,
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = !!disabled || !!loading;

  return (
    <StyledButton
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      $disabled={isDisabled}
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
