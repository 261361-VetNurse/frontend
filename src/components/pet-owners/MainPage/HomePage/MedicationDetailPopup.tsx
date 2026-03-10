import { formatTimeForDisplay } from '@/utils/reminder-utils';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import React, { useState, useEffect } from 'react';
import { DashboardNotification } from '@/types/domain/dashboard';
import { getFrequencyLabel } from '@/components/pet-owners/MainPage/MedicationPage/MedicationDetailPopup';
import { getMedicationStatus } from '@/utils/medicationStatus';
import Image from '@/components/shared/Image';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

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
      return { label: 'Take', Icon: RadioButtonUncheckedIcon };
  }
};

export default function MedicationDetailPopup({
  noti,
  onClose,
  onToggleReminder,
  onEdit,
}: MedicationDetailPopupProps) {

  // Local state for instant optimistic UI update
  const [localNoti, setLocalNoti] = useState<DashboardNotification>(noti);

  useEffect(() => {
    setLocalNoti(noti);
  }, [noti]);

  const handleToggle = () => {
    // 1. Instant local update
    setLocalNoti(prev => ({
      ...prev,
      istaken: true,
      status: 'taken',
      taken_at: new Date().toISOString()
    }));
    // 2. Trigger parent update / API call
    onToggleReminder(noti.notification_id.toString(), true);
  };

  const formatTakenTime = (updatedAt: string | undefined) => {
    // Assuming updated_at is the taken time if status is taken
    if (!updatedAt) return '';
    const date = dayjs.utc(updatedAt).local();
    return `Taken at ${formatTimeForDisplay(
      `${date.hour().toString().padStart(2, '0')}:${date.minute().toString().padStart(2, '0')}`
    )}`;
  };

  const renderNotification = () => {
    const notiDate = dayjs(localNoti.notification_at);
    const timeStr = `${notiDate.hour().toString().padStart(2, '0')}:${notiDate.minute().toString().padStart(2, '0')}`;

    // Compute status: if already taken trust it; otherwise calculate pending/missed from time
    let status = localNoti.istaken ? 'taken' : 'pending';
    if (status !== 'taken') {
      status = getMedicationStatus(timeStr, false, localNoti.notification_at);
    }

    const { label, Icon } = getStatusMeta(status);
    const isTaken = status === 'taken';

    return (
      <ReminderItem
        key={localNoti._id}
      >
        <div className='reminder-time'>{formatTimeForDisplay(timeStr)}</div>

        <div className='reminder-status'>
          <StatusButton
            $status={status}
            onClick={() => !isTaken && handleToggle()}
            title={label}
            disabled={isTaken}
          >
            <Icon style={{ width: 16, height: 16 }} />
            <span>{label}</span>
          </StatusButton>

          {isTaken && localNoti.taken_at && (
            <div className='taken-time'>{formatTakenTime(localNoti.taken_at)}</div>
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