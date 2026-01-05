"use client";

import styled from 'styled-components';

export interface ContainerProps {
  width: number | string;
  children: React.ReactNode;
  padding?: number | string;
  className?: string;
}

interface StyledContainerProps {
  $width: string;
  $padding: string;
}

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;

  width: ${({ $width }) => $width};
  padding: ${({ $padding }) => $padding};
  margin-bottom: 60px;
`;

export default function Container({
  width,
  children,
  padding,
  className,
  ...props
}: ContainerProps) {
  const processValue = (value: number | string): string =>
    typeof value === 'number' ? `${value}px` : value;

  const resolvedPadding = padding
    ? processValue(padding)
    : '8px 24px';

  return (
    <StyledContainer
      $width={processValue(width)}
      $padding={resolvedPadding}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}