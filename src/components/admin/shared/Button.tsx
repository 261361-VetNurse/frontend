'use client';

import { Children } from 'react';
import React from 'react';
import styled from 'styled-components';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Shape = 'rounded' | 'pill';
type Icon = 'none' | 'left' | 'right' | 'only';

type ButtonStyleProps = {
    $variant?: Variant;
    $size?: Size;
    $shape?: Shape;
    $icon?: Icon;
    $loading?: boolean;
    disabled?: boolean;
};

export interface ButtonProps {
    variant?: Variant;
    size?: Size;
    shape?: Shape;
    icon?: Icon;
    disabled?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ButtonStyled = styled.button<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  border-style: solid;
  border-width: 1px;

  /* ---------- SIZE ---------- */
  height: ${({ $size }) =>
        $size === 'sm' ? '32px' :
            $size === 'lg' ? '48px' :
                '40px'};

  padding: ${({ $icon, $size }) =>
        $icon === 'only'
            ? '0'
            : $size === 'sm'
                ? '0 12px'
                : $size === 'lg'
                    ? '0 20px'
                    : '0 16px'};

  font-size: ${({ $size }) =>
        $size === 'sm' ? '13px' :
            $size === 'lg' ? '16px' :
                '14px'};

  width: ${({ $icon, $size }) =>
        $icon === 'only'
            ? $size === 'sm'
                ? '32px'
                : $size === 'lg'
                    ? '48px'
                    : '40px'
            : 'auto'};

  /* ---------- SHAPE ---------- */
  border-radius: ${({ $shape }) =>
        $shape === 'pill' ? '999px' : '8px'};

  /* ---------- VARIANT ---------- */
  background: ${({ $variant }) =>
        $variant === 'secondary'
            ? '#f2f2f2'
            : $variant === 'outline' || $variant === 'ghost'
                ? 'transparent'
                : $variant === 'danger'
                    ? '#d92d20'
                    : '#000'};

  color: ${({ $variant }) =>
        $variant === 'secondary'
            ? '#111'
            : $variant === 'outline' || $variant === 'ghost'
                ? '#111'
                : '#fff'};

  border-color: ${({ $variant }) =>
        $variant === 'outline'
            ? '#111'
            : $variant === 'secondary'
                ? '#ddd'
                : $variant === 'ghost'
                    ? 'transparent'
                    : $variant === 'danger'
                        ? '#d92d20'
                        : '#000'};

  /* ---------- STATES ---------- */
  &:hover {
    background: ${({ $variant }) =>
        $variant === 'outline' || $variant === 'ghost'
            ? 'rgba(0,0,0,0.05)'
            : undefined};
    opacity: ${({ $variant }) =>
        $variant === 'primary' || $variant === 'danger'
            ? 0.9
            : 1};
  }

  &:active {
    transform: translateY(1px);
    opacity: 0.85;
  }

  /* ---------- DISABLED ---------- */
  ${({ disabled }) =>
        disabled &&
        `
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}

  /* ---------- LOADING ---------- */
  ${({ $loading }) =>
        $loading &&
        `
    pointer-events: none;
    opacity: 0.7;
  `}
`;


export default function Button({
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    icon = 'none',
    disabled = false,
    loading = false,
    children,
    onClick
}: ButtonProps) {
    return (
        <ButtonStyled
            $variant={variant}
            $size={size}
            $shape={shape}
            $icon={icon}
            disabled={disabled}
            $loading={loading}
            onClick={onClick}
        >
            {children}
        </ButtonStyled>
    );
}