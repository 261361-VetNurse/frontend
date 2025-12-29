"use client";

import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import '@/styles/layout/topbar.styles.scss';

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
    <header className="header-wrapper">
      <div className="topbar-container">
        <div className="left-section">
          {logoSrc ? (
            <div className="logo">
              <img src={logoSrc} alt="Logo" />
            </div>
          ) : (
            <div className="logo" />
          )}
          <span className="brand-text">{brandText}</span>
        </div>
        
        <div className="right-section">
          <button
            className="notification-button"
            onClick={onNotificationsClick}
            aria-label="Notifications"
          >
            <NotificationsOutlined />
          </button>
          
          <div className="vertical-divider" />
          
          <button
            className="user-menu-button"
            onClick={onUserMenuClick}
            aria-label="Open user menu"
          >
            {userAvatar ? (
              <div className="avatar">
                <img src={userAvatar} alt="User avatar" />
              </div>
            ) : (
              <div className="avatar">
                <AccountCircle />
              </div>
            )}
            
            <div className="user-text-block">
              <span className="user-name">{userName}</span>
              {userSubtitle && (
                <span className="user-subtitle">{userSubtitle}</span>
              )}
            </div>
            
            <div className="chevron-icon">
              <KeyboardArrowDown />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
