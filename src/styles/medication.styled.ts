import styled from 'styled-components';
import { theme } from './theme';

// Styled components
export const Page = styled.div`
  position: relative; 
  display: flex;
  flex-direction: column;
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

export const MedDetailOverlayStyled = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.2);
  padding: 0 16px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PopupCard = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  padding: 24px;
  width: 100%;
  max-width: 393px;
  gap: 16px;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${theme.colors.textSecondary};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

export const PetSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .pet-info{
    display: flex;
    flex-direction: column;
    .pet-name {
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
    }
    .pet-id{
      font-size: 12px;
      font-weight: 400;
      color: ${theme.colors.textSecondary};
    }
  }
  
`;

export const MedicineSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  .medicine-name {
    font-size: 20px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
  }
  .medicine-dosage {
    font-size: 14px;
    color: ${theme.colors.textSecondary};
  }
`;

export const ScheduleSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  .schedule-title {
    font-size: 16px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
  }
  .schedule-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }
  .info-label {
    color: ${theme.colors.textSecondary};
  }
  .info-value {
    color: ${theme.colors.textPrimary};
    font-weight: 500;
  }
`;

export const RemindersSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
  }
`;

export const ReminderItem = styled.div<{ $isHighlighted?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: ${(p) => (p.$isHighlighted ? "#E3F2FD" : "#F5F5F5")};
  border: ${(p) => (p.$isHighlighted ? `2px solid ${theme.colors.primary}` : "none")};
  .reminder-time {
    font-size: 16px;
    font-weight: 500;
    color: ${theme.colors.textPrimary};
  }
  .reminder-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const StatusButton = styled.button<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  background-color: ${({ $status }) =>
    $status === "taken" ? "#C8E6C9" :
    $status === "missed" ? "#FFCDD2" :
    "#BBDEFB"};

  color: ${({ $status }) =>
    $status === "taken" ? "#256029" :
    $status === "missed" ? "#C62828" :
    "#1565C0"};

  &:hover {
    opacity: 0.8;
  }

  .taken-time {
    font-size: 12px;
    color: ${theme.colors.textSecondary};
  }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  ${props => props.$variant === 'primary' ? `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  ` : `
    background-color: #F5F5F5;
    color: ${theme.colors.textPrimary};
  `}
  
  &:hover {
    opacity: 0.8;
  }
`;
