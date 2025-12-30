import styled from 'styled-components';
import { theme } from './theme';

// Styled components
export const Page = styled.div`
  padding: 8px 24px;
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
  min-height: 100vh;
  gap: 10px;
`;

export const PetSelectButton = styled.button`
  width: 100%;
  background-color: ${theme.colors.white};
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px 0 #00000025;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  .PetIcon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #e9ecef;
    color: ${theme.colors.textSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .PetSelectText {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
    text-align: left;
    margin-left: 16px;
  }

  .ChevronIcon {
    color: ${theme.colors.textSecondary};
    display: flex;
    align-items: center;
  }
`;


export const TabsWrap = styled.div`
  width: 100%;
  background-color: ${theme.colors.white};
  border-radius: 50px;
  display: flex;
  gap: 8px;
  height: 30px;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.$active ? theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? theme.colors.white : theme.colors.textSecondary};

  &:hover {
    background-color: ${props => props.$active ? theme.colors.primary : `${theme.colors.primary}20`};
  }
`;

export const Header = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    .Title {
        font-size: 18px;
        font-weight: 600;
        color: ${theme.colors.textPrimary};
    }

    .DateText {
        font-size: 14px;
        font-weight: 400;
        color: ${theme.colors.textPrimary};
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 4px;
    }
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .DateGroup {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .GroupHeader {
    font-size: 14px;
    font-weight: 400;
    color: ${theme.colors.textPrimary};
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
  }

  .Card {
    background-color: ${theme.colors.white};
    border-radius: 8px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
    gap: 8px;
    padding: 16px;
    overflow: hidden;
    
    .CardTopRow {
        text-align: right;
        border-bottom: 1px solid #d1d5db;
        margin-bottom: 8px;

        .ScheduleText {
            font-size: 12px;
            color: ${theme.colors.textSecondary};
            font-weight: 400;
        }
    }

    .CardBody {
        display: flex;
        align-items: flex-start;
        gap: 8px;

        .AvatarWrap {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${theme.colors.background};
            flex-shrink: 0;
            overflow: hidden;
            position: relative;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .TextCol {
            flex: 1;
            min-width: 0;
            gap: 4px;

            .PetName {
                font-size: 12px;
                color: ${theme.colors.textPrimary};
            }

            .MedName {
                font-size: 16px;
                font-weight: 600;
                color: ${theme.colors.textPrimary};
            }

            .Note {
                font-size: 13px;
                color: ${theme.colors.textSecondary};
                line-height: 1.3;
            }
        }
    }
  }
`;

export const FabButton = styled.button`
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  border: none;
  color: ${theme.colors.white};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1000;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;
