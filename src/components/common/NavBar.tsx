"use client";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, CalendarMonth, Pets, Medication, Notifications } from "@mui/icons-material";

const NavBarStyle = styled.div`
  position: fixed;
  display: flex;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: #fff;
  justify-content: center;
  box-shadow: 0 -2px 2px 0 rgba(0,0,0,0.25);
`;

const NavBarWrap = styled.footer`
  display: flex;
  flex-direction: row;
  width: 393px;
  padding: 8px 0;
  justify-content: space-between;
  align-items: center;
  
  
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
  { label: "Home", icon: Home, href: "/pet-owners/homepage" },
  { label: "Calendar", icon: CalendarMonth, href: "/pet-owners/calendarpage" },
  { label: "My pets", icon: Pets, href: "/" },
  { label: "Medication", icon: Medication, href: "/pet-owners/medication" },
  { label: "Notifications", icon: Notifications, href: "/" },
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
