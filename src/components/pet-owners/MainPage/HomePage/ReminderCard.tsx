import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Profile from "../../shared/Profile";
import { ReminderCardStyle } from "@/styles/components/homepage.styled";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DashboardNotification } from '@/types/domain/dashboard';
import { getFrequencyLabel } from '@/components/pet-owners/MainPage/HomePage/MedicationDetailPopup';

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
  datas: DashboardNotification;
  petImageSize?: number;
  onClick?: () => void;
};

export default function ReminderCard({
  datas,
  petImageSize = 40,
  onClick,
}: ReminderBoxProps) {
  const dateObj = new Date(datas.notification_at);
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const status = datas.status || 'pending';
  const freqArray = datas.frequency ? String(datas.frequency).split(',') : [];

  return (
    <ReminderCardStyle status={status} onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="card-header">
        <div className="info time">
          <AccessTimeIcon />
          <div>{timeStr}</div>
        </div>
        <div className="info frequency-label">
          {freqArray.map((freq, index) => (
            <span key={`${freq}-${index}`}>{getFrequencyLabel(freq.trim())}</span>
          ))}
          <CalendarMonthIcon />
        </div>
      </div>
      <div className="card-info">
        <div className='flex flex-row gap-2 items-center'>
          <Profile imageUrl={datas.pet_image} size={petImageSize} isPet={true} />
          <div className="reminder-text">
            <div className="med-name">
              {datas.medicine_name}
              {datas.dosage && (
                <span className="med-dosage-inline">
                  {" "}
                  {datas.dosage}
                </span>
              )}
            </div>
            <div className="pet-name">
              {datas.pet_name}
            </div>
          </div>
        </div>
        <div className="status-icon" aria-label={status}>
          {getStatusIcon(status)}
        </div>
      </div>
    </ReminderCardStyle>
  );
}
