import styled, { keyframes, DefaultTheme } from 'styled-components';
import { theme } from '../theme';

const spin = keyframes`
  from {
    stroke-dashoffset: 31.416;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

interface StyledButtonProps {
  $loading?: boolean;
  $size?: 'lg' | 'md' | 'sm';
  $fullWidth?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background-color: ${theme.colors.primary};
  color: #ffffff;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(9, 191, 248, 0.3);
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background-color: #08A6D8;
    box-shadow: 0 6px 16px rgba(9, 191, 248, 0.4);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(9, 191, 248, 0.3);
  }

  &:disabled {
    background-color: #a3d3f5;
    cursor: not-allowed;
    box-shadow: none;
  }

  ${props => props.$loading && `
    cursor: wait;
  `}

  /* Size variants */
  ${props => props.$size === 'lg' && `
    height: 56px;
    font-size: 18px;
    padding: 0 24px;
  `}

  ${props => props.$size === 'md' && `
    height: 48px;
    font-size: 16px;
    padding: 0 20px;
  `}

  ${props => props.$size === 'sm' && `
    height: 40px;
    font-size: 14px;
    padding: 0 16px;
  `}

  ${props => props.$fullWidth && `
    width: 100%;
  `}
`;

export const Spinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

export const SpinnerCircle = styled.circle`
  animation: ${spin} 1s linear infinite;
`;

export const ButtonText = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;
