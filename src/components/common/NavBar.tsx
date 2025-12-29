"use client";
import styled from "styled-components";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NavBarWrap = styled.footer`
  display: flex;
  height: 60px;
  padding: 8px 24px;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 -2px 2px rgba(0,0,0,0.25);
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
    font-size: 12px;
    font-weight: 400;
  }
`;

const navItems = [
  { label: "Home", icon: "/home-navbar.svg", activeIcon: "/home-blue-navbar.svg", href: "/pet-owners/homepage" },
  { label: "Calendar", icon: "/calendar-navbar.svg", activeIcon: "/calendar-blue-navbar.svg", href: "/pet-owners/appointmentpage" },
  { label: "My pets", icon: "/mypets-navbar.svg", activeIcon: "/mypets-blue-navbar.svg", href: "/" },
  { label: "Community", icon: "/community-navbar.svg", activeIcon: "/community-blue-navbar.svg", href: "/" },
  { label: "Notifications", icon: "/notifications-navbar.svg", activeIcon: "/notifications-blue-navbar.svg", href: "/" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <NavBarWrap>
      {navItems.map((item) => (
        <NavItem key={item.label} href={item.href}>
          <img
            src={pathname === item.href ? item.activeIcon : item.icon}
            alt={item.label}
          />
          <span className="nav-text">{item.label}</span>
        </NavItem>
      ))}
    </NavBarWrap>
  );
}
