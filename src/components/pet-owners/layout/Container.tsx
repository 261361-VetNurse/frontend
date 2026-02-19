"use client";

import styled from 'styled-components';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: number | string;
  className?: string;
}

interface StyledContainerProps {
  $padding: string;
}

const StyledContainer = styled.div<StyledContainerProps>`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;

  box-sizing: border-box;
  width: 100%;             
  padding: ${({ $padding }) => $padding};

  margin-bottom: 60px;
`;

export default function Container({
  children,
  padding,
  className,
  ...props
}: ContainerProps) {
  const processValue = (value: number | string): string =>
    typeof value === 'number' ? `${value}px` : value;

  const resolvedPadding = padding
    ? processValue(padding)
    : '8px 16px';

  return (
    <StyledContainer
      $padding={resolvedPadding}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}
