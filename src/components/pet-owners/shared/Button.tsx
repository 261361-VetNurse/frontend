'use client';

import React from 'react';
import styled from 'styled-components';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Shape = 'rounded' | 'pill';
type IconMode = 'none' | 'left' | 'right' | 'only';
type Align = 'center' | 'space-between';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    shape?: Shape;
    icon?: IconMode;

    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;

    fullWidth?: boolean;
    align?: Align;

    loading?: boolean;

    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const minHeightBySize: Record<Size, number> = { sm: 40, md: 44, lg: 48 };
const fontSizeBySize: Record<Size, number> = { sm: 13, md: 14, lg: 16 };
const padXBySize: Record<Size, number> = { sm: 12, md: 14, lg: 16 };
const iconSizeBySize: Record<Size, number> = { sm: 16, md: 18, lg: 20 };

const tokens = {
    text: '#111',
    white: '#fff',
    border: '#111',
    borderSoft: '#e6e6e6',
    bgPrimary: '#09BFF8',
    bgSecondary: '#f2f2f2',
    danger: '#d92d20',
    focusRing: 'rgba(0,0,0,0.18)',
};

const StyledButton = styled.button<{
    $variant: Variant;
    $size: Size;
    $shape: Shape;
    $icon: IconMode;
    $fullWidth: boolean;
    $align: Align;
    $loading: boolean;
    $disabled: boolean;
    $iconPx: number;
}>`
  /* base */
  position: relative;
  display: inline-flex;
  align-items: center;

  justify-content: ${({ $align }) => ($align === 'space-between' ? 'space-between' : 'center')};
  gap: 10px;

  width: ${({ $icon, $size, $fullWidth }) =>
        $icon === 'only'
            ? `${minHeightBySize[$size]}px`
            : $fullWidth
                ? '100%'
                : 'auto'};


  min-height: ${({ $size }) => `${minHeightBySize[$size]}px`};
  padding: ${({ $icon, $size }) => {
        // icon-only: square
        if ($icon === 'only') return '0';
        return `0 ${padXBySize[$size]}px`;
    }};

  border-radius: ${({ $shape }) => ($shape === 'pill' ? '999px' : '10px')};
  border: 1px solid transparent;

  font-weight: 700;
  font-size: ${({ $size }) => `${fontSizeBySize[$size]}px`};

  cursor: pointer;
  user-select: none;
  transition: 0.15s ease;
  outline: none;

  /* IMPORTANT: content rule */
  white-space: nowrap;

  /* variants */
  background: ${({ $variant }) =>
        $variant === 'primary'
            ? tokens.bgPrimary
            : $variant === 'secondary'
                ? tokens.bgSecondary
                : $variant === 'danger'
                    ? tokens.danger
                    : 'transparent'};

    box-shadow: ${({ $variant }) =>
            $variant === 'primary' || $variant === 'danger' || $variant === 'secondary'
                ? '0 4px 4px rgba(0,0,0,0.25)'
                : 'none'};

  color: ${({ $variant }) =>
        $variant === 'primary' || $variant === 'danger'
            ? tokens.white
            : tokens.text};

  border-color: ${({ $variant }) =>
        $variant === 'outline'
            ? tokens.border
            : $variant === 'secondary'
                ? tokens.borderSoft
                : $variant === 'ghost'
                    ? 'transparent'
                    : $variant === 'primary'
                        ? tokens.bgPrimary
                        : $variant === 'danger'
                            ? tokens.danger
                            : 'transparent'};

  /* hover */
  &:hover {
    opacity: ${({ $variant }) =>
        $variant === 'primary' || $variant === 'danger' ? 0.92 : 1};

    background: ${({ $variant }) =>
        $variant === 'outline' || $variant === 'ghost'
            ? 'rgba(0,0,0,0.06)'
            : undefined};
  }

  /* pressed */
  &:active {
    transform: translateY(1px);
    opacity: 0.86;
  }

  /* focus */
  &:focus-visible {
    box-shadow: 0 0 0 4px ${tokens.focusRing};
  }

  /* disabled / loading */
  ${({ $disabled }) =>
        $disabled &&
        `
      opacity: 0.55;
      cursor: not-allowed;
      pointer-events: none;
      transform: none !important;
    `}
`;

const Content = styled.span<{ $loading: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  /* IMPORTANT: lock layout and avoid text wrap */
  white-space: nowrap;

  /* When loading: keep space but hide content */
  opacity: ${({ $loading }) => ($loading ? 0 : 1)};
`;

const IconSlot = styled.span<{ $px: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $px }) => `${$px}px`};
  height: ${({ $px }) => `${$px}px`};

  svg,
  img {
    width: ${({ $px }) => `${$px}px`};
    height: ${({ $px }) => `${$px}px`};
    display: block;
  }
`;

const SpinnerOverlay = styled.span`
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const Spinner = styled.span<{ $px: number }>`
  width: ${({ $px }) => `${$px}px`};
  height: ${({ $px }) => `${$px}px`};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: ${({ $px }) => `${$px}px`};
    height: ${({ $px }) => `${$px}px`};
    display: block;
  }
`;

const SpinnerCircle = styled.circle`
  animation: spinDash 0.9s ease infinite;

  @keyframes spinDash {
    0% {
      stroke-dashoffset: 31.416;
      transform: rotate(0deg);
      transform-origin: 50% 50%;
    }
    50% {
      stroke-dashoffset: 10;
      transform: rotate(180deg);
      transform-origin: 50% 50%;
    }
    100% {
      stroke-dashoffset: 31.416;
      transform: rotate(360deg);
      transform-origin: 50% 50%;
    }
  }
`;

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    icon = 'none',
    leftIcon,
    rightIcon,
    fullWidth = false,
    align = 'center',
    loading = false,
    disabled,
    type = 'button',
    onClick,
    ...props
}: ButtonProps) {
    const isDisabled = !!disabled || !!loading;
    const iconPx = iconSizeBySize[size];

    const showLeft = icon === 'left' && !!leftIcon;
    const showRight = icon === 'right' && !!rightIcon;
    const iconOnly = icon === 'only';

    // content rules: iconOnly ต้องมี aria-label
    const ariaLabel =
        props['aria-label'] ??
        (iconOnly && typeof children === 'string' ? children : undefined);

    return (
        <StyledButton
            type={type}
            $variant={variant}
            $size={size}
            $shape={shape}
            $icon={icon}
            $fullWidth={fullWidth}
            $align={align}
            $loading={loading}
            $disabled={isDisabled}
            $iconPx={iconPx}
            disabled={isDisabled}
            aria-label={ariaLabel}
            onClick={onClick}
            {...props}
        >
            {/* Content stays in DOM to lock width (no jitter) */}
            <Content $loading={loading}>
                {showLeft && <IconSlot $px={iconPx}>{leftIcon}</IconSlot>}

                {!iconOnly && <span>{children}</span>}

                {showRight && <IconSlot $px={iconPx}>{rightIcon}</IconSlot>}

                {iconOnly && (
                    <IconSlot $px={iconPx}>{leftIcon ?? rightIcon ?? children}</IconSlot>
                )}
            </Content>

            {/* Spinner overlay (no layout shift) */}
            {loading && (
                <SpinnerOverlay>
                    <Spinner $px={iconPx}>
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
                </SpinnerOverlay>
            )}
        </StyledButton>
    );
}
