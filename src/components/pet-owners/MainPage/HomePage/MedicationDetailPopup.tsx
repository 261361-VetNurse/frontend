import { formatTimeForDisplay } from '@/utils/reminder-utils';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import React from 'react';
import { DashboardNotification } from '@/types/domain/dashboard';

import Image from '@/components/shared/Image';
// SVG icon wrappers replacing MUI icons
const CheckCircleIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Image width={24} height={24} src="/complete.svg" alt="taken" style={{ width: 16, height: 16, ...style }} />
);
const MedicationIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Image width={24} height={24} src="/medication.svg" alt="medication" style={{ width: 24, height: 24, ...style }} />
);

interface MedicationDetailPopupProps {
  noti: DashboardNotification;
  page: 'home-page' | 'medication-page';
  onClose: () => void;
  onToggleReminder: (reminderId: string, isTaken: boolean) => void;
  onEdit: () => void;
}

const getStatusMeta = (status: string) => {
  switch (status) {
    case 'sent':
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon };
    case 'pending':
    default:
      return { label: 'Pending', Icon: RadioButtonUncheckedIcon };
  }
};

export const getFrequencyLabel = (freq: string | number): string => {
  const f = String(freq).toLowerCase();
  switch (f) {
    case '-1':
    case 'everyday':
      return 'Everyday';
    case '0': return 'Monday';
    case '1': return 'Tuesday';
    case '2': return 'Wednesday';
    case '3': return 'Thursday';
    case '4': return 'Friday';
    case '5': return 'Saturday';
    case '6': return 'Sunday';
    default: return String(freq);
  }
};


export default function MedicationDetailPopup({
  noti,
  onClose,
  onToggleReminder,
  onEdit,
}: MedicationDetailPopupProps) {

  const formatTakenTime = (updatedAt: string | undefined) => {
    // Assuming updated_at is the taken time if status is taken
    if (!updatedAt) return '';
    const date = new Date(updatedAt);
    return `Taken at ${formatTimeForDisplay(
      `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    )}`;
  };

  const renderNotification = () => {
    const status = noti.status || 'pending';
    const { label, Icon } = getStatusMeta(status);

    // const notifDate = new Date(notification._at);
    const notiDate = new Date(noti.notification_at);
    const timeStr = `${notiDate.getHours().toString().padStart(2, '0')}:${notiDate.getMinutes().toString().padStart(2, '0')}`;

    return (
      <ReminderItem
        key={noti._id}
      >
        <div className='reminder-time'>{formatTimeForDisplay(timeStr)}</div>

        <div className='reminder-status'>
          <StatusButton
            $status={noti.status || 'pending'}
            onClick={() => onToggleReminder(noti._id, !noti.istaken)}
            title={noti.status || 'pending'}
          >
            <Icon style={{ width: 16, height: 16 }} />
            <span>{label}</span>
          </StatusButton>

          {noti.istaken && (
            <div className='taken-time'>{formatTakenTime(noti.taken_at)}</div>
          )}
        </div>
      </ReminderItem>
    );
  };

  return (
    <FormDialog
      open={true}
      onClose={onClose}
      title="Medication Detail"
      primaryLabel="Edit Medication"
      onPrimary={onEdit}
    >
      <div className='flex flex-col gap-4'>
        <PetSection>
          <Profile imageUrl={noti.pet_image} size={50} isPet={true} />
          <div className='pet-info'>
            <div className="pet-name">{noti.pet_name}</div>
            <div className="pet-id">id: {noti.pet_id}</div>
          </div>
        </PetSection>

        <MedicineSection>
          <MedicationIcon style={{ color: '#cccccc' }} />
          <div className="medicine-name">{noti.medicine_name}</div>
          <div className="medicine-dosage">({noti.dosage})</div>
        </MedicineSection>

        <ScheduleSection>
          <div className='schedule-info'>
            <div className='info-row'>
              <div className='info-label'>Frequency:</div>
              <div className='info-value'>{getFrequencyLabel(noti.frequency || '')}</div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Times per day:</div>
              <div className='info-value'>{noti.time_per_day}</div>
            </div>
          </div>
        </ScheduleSection>

        <RemindersSection >
          {renderNotification()}
        </RemindersSection>
      </div>
    </FormDialog>
  );
}