import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Profile from "../../shared/Profile";
import { ReminderCardStyle } from "@/styles/components/homepage.styled";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export type OccurrenceStatus = "pending" | "taken" | "missed";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "taken":
      return <CheckCircleIcon />;
    case "missed":
      return <ErrorOutlineIcon />;
    case "pending":
    default:
      return <RadioButtonUncheckedIcon />;
  }
};

export type ReminderBoxProps = {
  petImageUrl: string;
  medicineName: string;
  dosage?: string;
  schedule: { frequency_label: string; time: string };
  status: string; // ✅ เปลี่ยนจาก is_taken
  petImageSize?: number;
  onClick?: () => void;
};

export default function ReminderCard({
  petImageUrl,
  medicineName,
  dosage,
  schedule,
  status,
  petImageSize = 40,
  onClick,
}: ReminderBoxProps) {
  return (
    <ReminderCardStyle status={status} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="card-header">
        <div className="info time">
          <AccessTimeIcon />
          <div>{schedule.time}</div>
        </div>
        <div className="info frequency-label">
          {schedule.frequency_label}
          <CalendarMonthIcon />
        </div>
      </div>
      <div className="card-info">
        <div className='flex flex-row gap-2 items-center'>
          <Profile imageUrl={petImageUrl} size={petImageSize} />
          <div className="reminder-text">
            <div className="med-name">{medicineName}</div>
            <div className="med-dosage">{dosage ? `${dosage}` : ''}</div>
          </div>
        </div>
        <div className="status-icon" aria-label={status}>
          {getStatusIcon(status)}
        </div>
      </div>
    </ReminderCardStyle>
  );
}
