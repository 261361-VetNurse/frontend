"use client";

import styled from "styled-components";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, CalendarMonth, Pets, Medication, Notifications } from "@mui/icons-material";

// const NavBarStyle = styled.div`
//   position: fixed;
//   display: flex;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   width: 100%;
//   background: #fff;
//   justify-content: center;
//   z-index: 1000;
//   box-shadow: 0 -2px 2px 0 rgba(0,0,0,0.25);
// `;
const NavBarStyle = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: #fff;
  z-index: 1000;
  box-shadow: 0 -2px 2px rgba(0,0,0,0.15);
`;

// const NavBarWrap = styled.footer`
//   display: flex;
//   flex-direction: row;
//   width: 393px;
//   padding: 8px 0;
//   justify-content: space-between;
//   align-items: center;
// `;

const NavBarWrap = styled.footer`
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  width: 100%;
  max-width: 420px;      
  margin: 0 auto;       
  padding: 8px 0;
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 64px;
  cursor: pointer;
  text-decoration: none;

  .nav-text{
    color: #000;
    text-align: center;
    font-size: 11px;
    font-weight: 400;
  }
`;

const navItems = [
  { label: "Home", icon: Home, href: "/pet-owners/home-page" },
  { label: "Calendar", icon: CalendarMonth, href: "/pet-owners/calendar-page" },
  { label: "My pets", icon: Pets, href: "/pet-owners/my-pets-page" },
  { label: "Medication", icon: Medication, href: "/pet-owners/medication-page" },
  { label: "Notifications", icon: Notifications, href: "/pet-owners/notification-page" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <NavBarStyle>
      <NavBarWrap>
        {navItems.map((item) => (
          <NavItem key={item.label} href={item.href}>
            <item.icon
              sx={{
                fontSize: 24,
                color: pathname === item.href ? '#2196F3' : '#C3C3C3'
              }}
            />
            <span className="nav-text">{item.label}</span>
          </NavItem>
        ))}
      </NavBarWrap>
    </NavBarStyle>

  );
}