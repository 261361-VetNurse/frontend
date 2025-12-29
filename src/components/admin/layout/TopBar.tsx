"use client";

import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import styled from "styled-components";

const HeaderWrapper = styled.header`
  width: 100%;
  background-color: white;
  border-bottom: 1px solid #E5E7EB;
`;

const TopbarContainer = styled.div`
  max-width: 1440px;
  height: 70px;
  padding: 24px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    height: 64px;
    padding: 0 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BrandText = styled.span`
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
  color: #111827;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

const NotificationButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #F3F4F6;
  }

  &:focus-visible {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
  }

  svg {
    font-size: 24px;
    color: #6B7280;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 32px;
  background-color: #E5E7EB;
  margin: 0 16px;
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #F3F4F6;
  }

  &:focus-visible {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    font-size: 32px;
    color: #6B7280;
  }
`;

const UserTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 100px;
  flex: 1;

  @media (max-width: 480px) {
    .userSubtitle {
      display: none;
    }
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  line-height: 17px;
`;

const UserSubtitle = styled.span`
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  line-height: 14px;

  @media (max-width: 480px) {
    display: none;
  }
`;

const ChevronIcon = styled.div`
  display: flex;
  align-items: center;
  color: #6B7280;

  svg {
    font-size: 20px;
  }
`;

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
    <HeaderWrapper>
      <TopbarContainer>
        <LeftSection>
          {logoSrc ? (
            <Logo>
              <img src={logoSrc} alt="Logo" />
            </Logo>
          ) : (
            <Logo />
          )}
          <BrandText>{brandText}</BrandText>
        </LeftSection>
        
        <RightSection>
          <NotificationButton
            onClick={onNotificationsClick}
            aria-label="Notifications"
          >
            <NotificationsOutlined />
          </NotificationButton>
          
          <VerticalDivider />
          
          <UserMenuButton
            onClick={onUserMenuClick}
            aria-label="Open user menu"
          >
            {userAvatar ? (
              <Avatar>
                <img src={userAvatar} alt="User avatar" />
              </Avatar>
            ) : (
              <Avatar>
                <AccountCircle />
              </Avatar>
            )}
            
            <UserTextBlock>
              <UserName>{userName}</UserName>
              {userSubtitle && (
                <UserSubtitle>{userSubtitle}</UserSubtitle>
              )}
            </UserTextBlock>
            
            <ChevronIcon>
              <KeyboardArrowDown />
            </ChevronIcon>
          </UserMenuButton>
        </RightSection>
      </TopbarContainer>
    </HeaderWrapper>
  );
}
