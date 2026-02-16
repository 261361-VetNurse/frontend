import { formatTimeForDisplay } from '@/utils/reminder-utils';
import { Medicine } from '@/types/domain/medication';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import MedicationIcon from '@mui/icons-material/Medication';

interface MedicationDetailPopupProps {
  medicineReminder: any;
  occurrences?: any[]; // For MedicationPage to match statuses for specific day
  highlightedReminderId?: number;
  page: 'home-page' | 'medication-page';
  onClose: () => void;
  onToggleReminder: (reminderId: number) => void;
  onEdit: () => void;
}

type OccurrenceStatus = 'pending' | 'taken' | 'missed' | 'sent';

const getStatus = (reminder: any): OccurrenceStatus => {
  if (typeof reminder === 'object' && reminder.status) {
    if (reminder.status === 'sent') return 'taken';
    return reminder.status;
  }
  if (typeof reminder === 'object' && reminder.istaken) return 'taken';
  return 'pending';
};

const getStatusMeta = (status: OccurrenceStatus) => {
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
const getFrequencyLabel = (freq: string | number): string => {
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
  medicineReminder,
  occurrences,
  highlightedReminderId,
  onClose,
  onToggleReminder,
  onEdit,
}: MedicationDetailPopupProps) {
  const formatTakenTime = (takenAt?: string) => {
    if (!takenAt) return '';
    const date = new Date(takenAt);
    return `Taken at ${formatTimeForDisplay(
      `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    )}`;
  };

  // Helper to normalize reminders list
  const remindersList = Array.isArray(medicineReminder.reminder_time)
    ? medicineReminder.reminder_time.map((t: string | any, idx: number) => {
      if (typeof t === 'string') {
        const planId = medicineReminder._id || medicineReminder.medicine_id;
        // Try to find matching occurrence from passed occurrences list
        const occ = occurrences?.find(o =>
          (o.plan_id === String(planId) || o.plan_id === planId) &&
          o.time === t
        );

        const status = occ ? getStatus(occ) : getStatus(medicineReminder);
        return {
          id: occ?.reminder_id || `${planId}_${t}`,
          time: t,
          status: status,
          taken_at: occ?.taken_at || medicineReminder.taken_at
        };
      }
      return t;
    })
    : [];

  return (
    <FormDialog
      open={true}
      onClose={onClose}
      title="Medication Detail"
      primaryLabel="Edit Medication"
      onPrimary={onEdit}
      secondaryLabel="Close"
      onSecondary={onClose}
    >
      <div className='flex flex-col gap-4'>
        <PetSection>
          {/* Handle cases where pet data might be flat or nested */}
          <Profile imageUrl={medicineReminder.pet_image || medicineReminder.pet?.profile_image} size={50} isPet={true} />
          <div className='pet-info'>
            <div className="pet-name">{medicineReminder.pet_name || medicineReminder.pet?.name}</div>
            <div className="pet-id">id: {medicineReminder.pet_id || medicineReminder.pet?._id}</div>
          </div>
        </PetSection>

        <MedicineSection>
          <MedicationIcon style={{ color: '#cccccc' }} />
          <div className="medicine-name">{medicineReminder.medicine_name || medicineReminder.name}</div>
          <div className="medicine-dosage">{medicineReminder.medicine_dosage || medicineReminder.dosage}</div>
        </MedicineSection>

        <ScheduleSection>
          <div className='schedule-title'>Schedule Information</div>
          <div className='px-4'>
            <div className='schedule-info'>
              <div className='info-row'>
                <div className='info-label'>Frequency:</div>
                <div className='info-value'>{getFrequencyLabel(medicineReminder.frequency || medicineReminder.medicine_frequency || '')}</div>
              </div>
              <div className='info-row'>
                <div className='info-label'>Times per day:</div>
                <div className='info-value'>{remindersList.length}</div>
              </div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Starting date:</div>
              <div className='info-value'>{medicineReminder.created_at || medicineReminder.start_date}</div>
            </div>
          </div>

        </ScheduleSection>

        <RemindersSection >
          <div className="section-title">Today's Reminders</div>
          {remindersList.map((reminder: any) => {
            const status = getStatus(reminder);
            const { label, Icon } = getStatusMeta(status);
            const isTaken = status === 'taken';

            return (
              <ReminderItem
                key={reminder.id}
              >
                <div className='reminder-time'>{formatTimeForDisplay(reminder.time)}</div>

                <div className='reminder-status'>
                  <StatusButton
                    $status={status}
                    onClick={() => !isTaken && onToggleReminder(medicineReminder.notification_id)}
                    title={label}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    <span>{label}</span>
                  </StatusButton>

                  {isTaken && reminder.taken_at && (
                    <div className='taken-time'>{formatTakenTime(reminder.taken_at)}</div>
                  )}
                </div>
              </ReminderItem>
            );
          })}
        </RemindersSection>

      </div>
    </FormDialog>
  );
}