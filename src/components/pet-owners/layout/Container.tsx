// "use client";

// import styled from 'styled-components';

// export interface ContainerProps {
//   width: number | string;
//   children: React.ReactNode;
//   padding?: number | string;
//   className?: string;
// }

// interface StyledContainerProps {
//   $width: string;
//   $padding: string;
// }

// const StyledContainer = styled.div<StyledContainerProps>`
//   display: flex;
//   position: relative;
//   flex-direction: column;
//   justify-content: flex-start;
//   align-items: center;
//   box-sizing: border-box;

//   width: ${({ $width }) => $width};
//   padding: ${({ $padding }) => $padding};
//   margin-bottom: 60px;
// `;

// export default function Container({
//   width,
//   children,
//   padding,
//   className,
//   ...props
// }: ContainerProps) {
//   const processValue = (value: number | string): string =>
//     typeof value === 'number' ? `${value}px` : value;

//   const resolvedPadding = padding
//     ? processValue(padding)
//     : '8px 24px';

//   return (
//     <StyledContainer
//       $width={processValue(width)}
//       $padding={resolvedPadding}
//       className={className}
//       {...props}
//     >
//       {children}
//     </StyledContainer>
//   );
// }

//-------------------------

// "use client";

// import styled from 'styled-components';

// export interface ContainerProps {
//   children: React.ReactNode;
//   padding?: number | string;
//   className?: string;
//   maxWidth?: number | string;
// }
// const StyledContainer = styled.div<{
//   $maxWidth?: string;
//   $padding: string;
// }>`
//   display: flex;
//   position: relative;
//   flex-direction: column;
//   align-items: stretch;
//   box-sizing: border-box;

//   width: 100%;
//   max-width: ${({ $maxWidth }) => $maxWidth ?? '100%'};
//   padding: ${({ $padding }) => $padding};

//   margin: 0 auto 60px;
//   overflow-x: hidden;
// `;
// export default function Container({
//   children,
//   padding,
//   className,
//   maxWidth,
//   ...props
// }: ContainerProps) {
//   const processValue = (value: number | string): string =>
//     typeof value === 'number' ? `${value}px` : value;

//   const resolvedPadding = padding
//     ? processValue(padding)
//     : '8px 16px';

//   return (
//     <StyledContainer
//       $maxWidth={maxWidth ? processValue(maxWidth) : undefined}
//       $padding={resolvedPadding}
//       className={className}
//       {...props}
//     >
//       {children}
//     </StyledContainer>
//   );
// }


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
  max-width: 100%;        
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
