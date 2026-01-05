'use client';

import styled from 'styled-components';
import { theme } from './theme';

export const Container = styled.div`
  background: #f5f5f5;
  min-height: 100vh;
  width: 100%;
  padding: 16px 24px;
  diasplay: flex;
  flex-direction: column;
`;

export const TopHeader = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0 0 0 0;
  height: 56px;
  position: relative;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px 0 8px;
  margin-right: 2px;
  cursor: pointer;
  svg {
    font-size: 16px;
    color: ${theme.colors.textPrimary};
  }
`;

export const PageTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #222;
  flex: 1;
  text-align: center;
  margin-right: 36px; /* To visually center with back button */
`;



export const Header = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 16px;
  gap: 16px;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 16px 0 16px 0;
`;

export const AvatarWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AvatarImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

export const OwnerName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #222;
`;

export const OwnerId = styled.div`
  font-size: 12px;
  color: #888;
`;

export const Section = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px;
  `;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.textPrimary};
  svg {
    font-size: 24px;
    color: ${theme.colors.textPrimary};
`;

export const EditLink = styled.a`
  font-size: 14px;
  color: #00b0ff;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
`;

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const InfoItem = styled.div``;

export const InfoLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #222;
`;

export const InfoValue = styled.div`
  font-size: 14px;
  color: #888;
  margin-top: 2px;
`;
