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
  box-sizing: border-box;
  margin: 0 auto;
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