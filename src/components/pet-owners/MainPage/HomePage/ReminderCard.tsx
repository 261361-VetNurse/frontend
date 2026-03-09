import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Profile from "../../shared/Profile";
import { ReminderCardStyle } from "@/styles/components/homepage.styled";
const CheckCircleIcon = () => <Image width={24} height={24} src="/complete.svg" alt="taken" style={{ width: 20, height: 20 }} />;
const AccessTimeIcon = () => <Image width={24} height={24} src="/clock.svg" alt="time" style={{ width: 20, height: 20 }} />;
const CalendarMonthIcon = () => <Image width={24} height={24} src="/calendar.svg" alt="calendar" style={{ width: 20, height: 20 }} />;
import { DashboardNotification } from '@/types/domain/dashboard';
import { getFrequencyLabel } from '@/components/pet-owners/MainPage/MedicationPage/MedicationDetailPopup';

import Image from '@/components/shared/Image';
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

import dayjs from "dayjs";

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
  const dateObj = dayjs(datas.notification_at);
  const hours = dateObj.hour().toString().padStart(2, '0');
  const minutes = dateObj.minute().toString().padStart(2, '0');
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
