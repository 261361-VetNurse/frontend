"use client"
import NavBar from '@/components/pet-owners/common/NavBar';
import styled from "styled-components";

const CalendarPageStyled = styled.div`
width: 393px;
    position: relative;
    height: 100dvh;
`;
export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <CalendarPageStyled>
            {children}
          <NavBar/>
        </CalendarPageStyled>
  );
}
