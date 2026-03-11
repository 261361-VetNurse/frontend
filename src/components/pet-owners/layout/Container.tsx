"use client";

import styled from 'styled-components';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: number | string;
  className?: string;
  hasNavBar?: boolean;
}

interface StyledContainerProps {
  $padding: string;
  $hasNavBar: boolean;
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

  margin-bottom: ${({ $hasNavBar }) => ($hasNavBar ? '60px' : '24px')};
`;

export default function Container({
  children,
  padding,
  className,
  hasNavBar = false,
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
      $hasNavBar={hasNavBar}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}
