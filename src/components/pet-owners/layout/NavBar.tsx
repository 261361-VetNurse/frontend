"use client";

import styled from "styled-components";
import { usePathname } from '@/hooks/use-next-routing';
import { Link } from 'react-router-dom';
import Image from '@/components/shared/Image';

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

const NavBarWrap = styled.footer`
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  width: 100%;
  max-width: 50%;      
  margin: 0 auto;       
  padding: 8px 0;
  @media (max-width: 670px) {
    max-width: 100%;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 40px;
  cursor: pointer;
  text-decoration: none;

  .nav-text{
    color: #000;
    text-align: center;
    font-size: 11px;
    font-weight: 400;

    @media (max-width: 330px) {
      display: none;
    }
  }
`;

const navItems = [
  { label: "Home", icon: "/home-navbar.svg", activeIcon: "/home-blue-navbar.svg", href: "/pet-owners/home-page" },
  { label: "Calendar", icon: "/calendar-navbar.svg", activeIcon: "/calendar-blue-navbar.svg", href: "/pet-owners/calendar-page" },
  { label: "My pets", icon: "/mypets-navbar.svg", activeIcon: "/mypets-blue-navbar.svg", href: "/pet-owners/my-pets-page" },
  { label: "Medication", icon: "/medication-navbar.svg", activeIcon: "/medication-blue-navbar.svg", href: "/pet-owners/medication-page" },
  { label: "Notifications", icon: "/notifications-navbar.svg", activeIcon: "/notifications-blue-navbar.svg", href: "/pet-owners/notification-page" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <NavBarStyle>
      <NavBarWrap>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavItem key={item.label} to={item.href}>
              <div className="relative" style={{ width: "24px", height: "24px" }}>
                <Image
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.label}
                  fill
                  sizes="24px"
                  objectFit="contain"
                />
              </div>
              <span className="nav-text">{item.label}</span>
            </NavItem>
          );
        })}
      </NavBarWrap>
    </NavBarStyle>

  );
}