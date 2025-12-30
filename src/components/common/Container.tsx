"use client";

import styled from 'styled-components';

export interface ContainerProps {
  maxWidth?: number | string;
  paddingX?: number | string;
  fluid?: boolean;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

interface StyledContainerProps {
  $maxWidth: string;
  $paddingX: string;
  $fluid: boolean;
}

const StyledContainer = styled.div<StyledContainerProps>`
  box-sizing: border-box;
  margin: 0 auto;
  padding-left: ${props => props.$paddingX};
  padding-right: ${props => props.$paddingX};
  ${props => !props.$fluid && `max-width: ${props.$maxWidth};`}
  width: 100%;
`;

export default function Container({
  maxWidth = '1280px',
  paddingX = '16px',
  fluid = false,
  as: Component = 'div',
  children,
  className,
  ...props
}: ContainerProps) {
  const processValue = (value: number | string): string => {
    return typeof value === 'number' ? `${value}px` : value;
  };

  return (
    <StyledContainer
      as={Component}
      $maxWidth={processValue(maxWidth)}
      $paddingX={processValue(paddingX)}
      $fluid={fluid}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}
