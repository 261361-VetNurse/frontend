"use client";

import TopBar from './TopBar';

export default function TopBarWrapper() {
  return (
    <TopBar
      brandText="NOVEL CMU"
      logoSrc="/logo-optimized.jpg"
      userAvatar="/logo-optimized.jpg"
      userName="Admin User"
      userSubtitle="Administrator"
      onNotificationsClick={() => console.log('Notifications clicked')}
      onUserMenuClick={() => console.log('User menu clicked')}
    />
  );
}
