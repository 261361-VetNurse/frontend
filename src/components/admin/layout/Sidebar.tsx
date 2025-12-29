"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import PetsOutlined from "@mui/icons-material/PetsOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import styled from "styled-components";

const SidebarNav = styled.nav`
  background-color: #FFFFFF;
  width: 250px;
  min-height: 100%;
  border-right: 1px solid #E5E7EB;
  padding: 12px 24px 24px;
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MenuItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #111827;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #F3F4F6;
  }

  &:focus-visible {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
  }

  ${props => props.$active && `
    background-color: #F3F4F6;
    
    .label {
      font-weight: 600;
    }
  `}
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 20px;
    color: #111827;
  }
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`;

interface MenuItemType {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItemType[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <HomeOutlined />,
  },
  {
    label: "Pet Owners",
    href: "/admin/pet-owners",
    icon: <GroupOutlined />,
  },
  {
    label: "Pets",
    href: "/admin/pets",
    icon: <PetsOutlined />,
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    icon: <EventAvailableOutlined />,
  },
  {
    label: "Community",
    href: "/admin/community",
    icon: <ForumOutlined />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarNav aria-label="Admin sidebar">
      <MenuList>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <li key={item.href}>
              <MenuItem
                href={item.href}
                $active={isActive}
              >
                <Icon>{item.icon}</Icon>
                <Label>{item.label}</Label>
              </MenuItem>
            </li>
          );
        })}
      </MenuList>
    </SidebarNav>
  );
}
