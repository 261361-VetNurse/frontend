import styled from "styled-components";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { theme } from "@/styles/theme";
import Profile from "../../shared/Profile";

export type OccurrenceStatus = "pending" | "taken" | "missed" | "skipped";

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

const getStatusIcon = (status: OccurrenceStatus) => {
  switch (status) {
    case "taken":
      return <CheckCircleIcon />;
    case "missed":
      return <ErrorOutlineIcon />;
    case "skipped":
      return <DoNotDisturbOnIcon />;
    case "pending":
    default:
      return <RadioButtonUncheckedIcon />;
  }
};

export type ReminderBoxProps = {
  petName: string;
  petImageUrl: string;
  medicineName: string;
  dosage?: string;
  timeLabel: string;

  status: OccurrenceStatus; // ✅ เปลี่ยนจาก is_taken

  petImageSize?: number;
  onClick?: () => void;
};

export default function ReminderBox({
  petName,
  petImageUrl,
  medicineName,
  dosage,
  timeLabel,
  status,
  petImageSize = 40,
  onClick,
}: ReminderBoxProps) {
  return (
    <ReminBox onClick={onClick} role={onClick ? "button" : undefined}>
      <Profile imageUrl={petImageUrl} size={petImageSize} />

      <ReminderText>
        <div className="pet-name">{petName}</div>
        <div className="med-name">{medicineName}{dosage ? ` - ${dosage}` : ''}</div>
        <div className="time">
          <AccessTimeIcon sx={{ fontSize: 16 }} />
          <div>{timeLabel}</div>
        </div>
      </ReminderText>

      <StatusIcon aria-label={status}>
        {getStatusIcon(status)}
      </StatusIcon>
    </ReminBox>
  );
}
