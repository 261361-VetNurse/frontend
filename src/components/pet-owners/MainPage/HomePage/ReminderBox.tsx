import styled from "styled-components";
import CheckIcon from '@mui/icons-material/Check';
import { theme } from "@/styles/theme";
import { Clock } from "lucide-react";
import Profile from "../../shared/Profile";

const ReminBox = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background-color: #fff;
    transition: all 0.2s ease-in-out;
    cursor: pointer;

    &:active {
        background-color: #f0f0f0;
    }
`;

const PetImg = styled.img<{ $size: number }>`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    border-radius: 9999px;
    object-fit: cover;
    flex: 0 0 auto;
`;

const ReminderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  .pet-name{
      font-size: 14px;
      font-weight: 600;
      color: ${theme.colors.textSecondary};
  }
  .med-name{
      font-size: 16px;
      font-weight: 700;
      color: ${theme.colors.textPrimary};
  }
  .time{
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: ${theme.colors.textSecondary};
  }
`;

const StatusIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 1000px;
  border: 2px solid ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  svg{
    width: 16px;
    height: 16px;
    color: ${theme.colors.primary};
  }
`;

export type ReminderBoxProps = {
    petName: string;
    petImageUrl: string; // เช่น "/pets-example/pet-ex1.svg" หรือ url จริง
    medicineName: string;
    dosage?: string;

    timeLabel: string; // เช่น "9:45 AM."

    // สถานะการทานยา
    is_taken: boolean;

    // optional
    petImageSize?: number; // default 40
    onClick?: () => void;
};

export default function ReminderBox({
                                        petName,
                                        petImageUrl,
                                        medicineName,
                                        dosage,
                                        timeLabel,
                                        is_taken,
                                        petImageSize = 40,
                                        onClick,
                                    }: ReminderBoxProps) {
    return (
        <ReminBox onClick={onClick} role={onClick ? "button" : undefined}>
            <Profile imageUrl={petImageUrl} size={petImageSize} />
            <ReminderText>
                <div className="pet-name">{petName}</div>
                <div className="med-name">{medicineName} - {dosage}</div>
                <div className="time">
                  <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  <div>{timeLabel}</div>
                </div>
                
            </ReminderText>

            {is_taken ? (
                <StatusIcon>
                  <CheckIcon />
                </StatusIcon>
            ) : (
                <StatusIcon/>
            )}
        </ReminBox>
    );
}
