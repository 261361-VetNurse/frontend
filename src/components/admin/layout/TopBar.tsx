"use client";

import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Image from 'next/image';

export interface TopBarProps {
  brandText?: string;
  logoSrc?: string;
  userAvatar?: string;
  userName: string;
  userSubtitle?: string;
  onNotificationsClick?: () => void;
  onUserMenuClick?: () => void;
}

export default function TopBar({
  brandText,
  logoSrc,
  userAvatar,
  userName,
  userSubtitle,
  onNotificationsClick,
  onUserMenuClick
}: TopBarProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-[1440px] h-[70px] px-6 flex items-center justify-between md:h-[64px] md:px-4">
        <div className="flex items-center gap-4">
          {logoSrc ? (
            <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden md:w-9 md:h-9">
              <Image 
                src={logoSrc} 
                alt="Logo" 
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 md:w-9 md:h-9" />
          )}
          <span className="font-bold text-xl text-gray-900 uppercase md:text-base">
            {brandText}
          </span>
        </div>
        
        <div className="flex items-center gap-0">
          <button
            onClick={onNotificationsClick}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            <NotificationsOutlined className="text-2xl text-gray-500" />
          </button>
          
          <div className="w-px h-8 bg-gray-200 mx-4" />
          
          <button
            onClick={onUserMenuClick}
            aria-label="Open user menu"
            className="flex items-center gap-3 px-3 py-2 border-none bg-transparent cursor-pointer rounded-lg transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            {userAvatar ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image 
                  src={userAvatar} 
                  alt="User avatar" 
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <AccountCircle className="text-3xl text-gray-500" />
              </div>
            )}
            
            <div className="flex flex-col items-start min-w-100px flex-1 md:userSubtitle">
              <span className="font-semibold text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-120px leading-4">
                {userName}
              </span>
              {userSubtitle && (
                <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-120px leading-3">
                  {userSubtitle}
                </span>
              )}
            </div>
            
            <div className="flex items-center text-gray-500">
              <KeyboardArrowDown className="text-xl" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
