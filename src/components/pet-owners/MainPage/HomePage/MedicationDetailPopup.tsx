import { formatTimeForDisplay } from '@/utils/reminder-utils';
import { Medicine } from '@/types/domain/medication';
import { Pet } from '@/types/domain/pet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import MedicationIcon from '@mui/icons-material/Medication';
import { DashboardMedicineDetail } from '@/types/domain/dashboard';
import { Icon } from 'lucide-react';

interface MedicationDetailPopupProps {
  noti: DashboardMedicineDetail;
  page: 'home-page' | 'medication-page';
  onClose: () => void;
  onToggleReminder: (reminderId: string, isTaken: boolean) => void;
  onEdit: () => void;
}

const getStatusMeta = (status: string) => {
  switch (status) {
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon };
    case 'pending':
    default:
      return { label: 'Pending', Icon: RadioButtonUncheckedIcon };
  }
};

const getFrequencyLabel = (freq: string): string => {
  switch (freq) {
    case '-1': return 'Everyday';
    case '0': return 'Monday';
    case '1': return 'Tuesday';
    case '2': return 'Wednesday';
    case '3': return 'Thursday';
    case '4': return 'Friday';
    case '5': return 'Saturday';
    case '6': return 'Sunday';
    default: return 'Custom';
  }
};


export default function MedicationDetailPopup({
  noti,
  onClose,
  onToggleReminder,
  onEdit,
}: MedicationDetailPopupProps) {

  const formatTakenTime = (updatedAt: string) => {
    // Assuming updated_at is the taken time if status is taken
    if (!updatedAt) return '';
    const date = new Date(updatedAt);
    return `Taken at ${formatTimeForDisplay(
      `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    )}`;
  };

  const renderNotification = () => {
    const { Icon } = getStatusMeta(noti.status);

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
            $status={noti.status}
            onClick={() => onToggleReminder(noti._id, !noti.istaken)}
            title={noti.status}
          >
            <Icon style={{ width: 16, height: 16 }} />
            <span>{noti.status}</span>
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
          <Profile imageUrl={noti.pet_image} size={50} />
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
              <div className='info-value'>{getFrequencyLabel(noti.frequency)}</div>
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