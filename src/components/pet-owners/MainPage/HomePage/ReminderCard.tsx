import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Profile from "../../shared/Profile";
import { ReminderCardStyle } from "@/styles/components/homepage.styled";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DashboardMedicineNotification } from '@/types/domain/dashboard';

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
  datas: DashboardMedicineNotification;
  petImageSize?: number;
  onClick?: () => void;
};

export default function ReminderCard({
  datas,
  petImageSize = 40,
  onClick,
}: ReminderBoxProps) {
  return (
    <ReminderCardStyle status={status} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="card-header">
        <div className="info time">
          <AccessTimeIcon />
          <div>{datas.notification_at}</div>
        </div>
        <div className="info frequency-label">
          {datas.frequency}
          <CalendarMonthIcon />
        </div>
      </div>
      <div className="card-info">
        <div className='flex flex-row gap-2 items-center'>
          <Profile imageUrl={datas.pet_image} size={petImageSize} />
          <div className="reminder-text">
            <div className="med-name">{datas.medicine_name}</div>
            <div className="med-dosage">{datas.dosage ? `${datas.dosage}` : ''}</div>
          </div>
        </div>
        <div className="status-icon" aria-label={status}>
          {getStatusIcon(status)}
        </div>
      </div>
    </ReminderCardStyle>
  );
}
