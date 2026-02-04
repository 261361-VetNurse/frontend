import { formatTimeForDisplay } from '@/utils/reminder-utils';
import { Medicine, MedicineNotification } from '@/types/domain/medication';
import { Pet } from '@/types/domain/pet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import MedicationIcon from '@mui/icons-material/Medication';

interface MedicationDetailPopupProps {
  medicine: Medicine;
  notification: MedicineNotification;
  pet: Pet;
  page: 'home-page' | 'medication-page';
  onClose: () => void;
  onToggleReminder: (reminderId: string, isTaken: boolean) => void;
  onEdit: () => void;
}

type OccurrenceStatus = 'pending' | 'taken' | 'missed' | 'skipped' | 'active';

const getStatus = (notification: MedicineNotification): OccurrenceStatus => {
  if (notification.istaken) return 'taken';
  // If skipped is a status in MedicineNotification? Schema says "status: string", "istaken: boolean".
  // Assuming status string can be 'skipped'.
  if (notification.status === 'skipped') return 'skipped';
  // Check if missed (time passed and not taken)
  const notifTime = new Date(notification.notification_at);
  const now = new Date();
  if (!notification.istaken && notifTime < now && notification.status !== 'skipped') {
    // return 'missed'; // Optional: if we want to show missed
  }
  return 'pending';
};

const getStatusMeta = (status: OccurrenceStatus) => {
  switch (status) {
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon };
    case 'skipped':
      return { label: 'Skipped', Icon: ErrorOutlineIcon }; // Use suitable icon
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
  medicine,
  notification,
  pet,
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
    const status = getStatus(notification);
    const { label, Icon } = getStatusMeta(status);
    const isTaken = status === 'taken';

    const notifDate = new Date(notification.notification_at);
    const timeStr = `${notifDate.getHours().toString().padStart(2, '0')}:${notifDate.getMinutes().toString().padStart(2, '0')}`;

    return (
      <ReminderItem
        key={notification._id}
      >
        <div className='reminder-time'>{formatTimeForDisplay(timeStr)}</div>

        <div className='reminder-status'>
          <StatusButton
            $status={status}
            onClick={() => onToggleReminder(notification._id, !isTaken)}
            title={label}
          >
            <Icon style={{ width: 16, height: 16 }} />
            <span>{label}</span>
          </StatusButton>

          {isTaken && (
            <div className='taken-time'>{formatTakenTime(notification.updated_at)}</div>
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
          <Profile imageUrl={pet.profile_image} size={50} />
          <div className='pet-info'>
            <div className="pet-name">{pet.name}</div>
            <div className="pet-id">id: {pet._id}</div>
          </div>
        </PetSection>

        <MedicineSection>
          <MedicationIcon style={{ color: '#cccccc' }} />
          <div className="medicine-name">{medicine.name}</div>
          <div className="medicine-dosage">({medicine.dosage})</div>
        </MedicineSection>

        <ScheduleSection>
          <div className='schedule-info'>
            <div className='info-row'>
              <div className='info-label'>Frequency:</div>
              <div className='info-value'>{getFrequencyLabel(medicine.frequency)}</div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Times per day:</div>
              <div className='info-value'>{medicine.reminder_time.length}</div>
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