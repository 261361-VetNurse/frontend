"use client";

import styled from 'styled-components';

export interface ContainerProps {
  width: number | string;
  children: React.ReactNode;
  className?: string;
}

interface StyledContainerProps {
  $width: string;
}

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 8px 24px;
  margin-bottom: 60px;
  width: ${props => props.$width};
`;

export default function Container({
  width,
  children,
  className,
  ...props
}: ContainerProps) {
  const processValue = (value: number | string): string => {
    return typeof value === 'number' ? `${value}px` : value;
  };

  return (
    <StyledContainer
      $width={processValue(width)}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}