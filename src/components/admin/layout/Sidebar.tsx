"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import PetsOutlined from "@mui/icons-material/PetsOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";

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
    <nav className="bg-white w-[250px] min-h-full border-r border-gray-200 py-3 px-6" aria-label="Admin sidebar">
      <ul className="list-none m-0 p-0 flex flex-col gap-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 h-11 px-3 rounded-lg no-underline text-gray-900 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
                  isActive ? 'bg-gray-100' : ''
                }`}
              >
                <span className="flex items-center justify-center">
                  <span className="text-xl text-gray-900">
                    {item.icon}
                  </span>
                </span>
                <span className={`text-sm font-medium text-gray-900 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
