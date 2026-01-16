import { formatTimeForDisplay } from '@/lib/reminder-utils';
import { MedicineReminderVM } from '@/types/medicine-reminder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import MedicationIcon from '@mui/icons-material/Medication';

interface MedicationDetailPopupProps {
  medicineReminder: MedicineReminderVM;
  highlightedReminderId?: string;
  page: 'home-page' | 'medication-page';
  onClose: () => void;
  onToggleReminder: (reminderId: string, isTaken: boolean) => void;
  onEdit: () => void;
}

type OccurrenceStatus = 'pending' | 'taken' | 'missed';

const getStatus = (reminder: any): OccurrenceStatus => {
  if (reminder.status) return reminder.status;
  return reminder.is_taken ? 'taken' : 'pending';
};

const getStatusMeta = (status: OccurrenceStatus) => {
  switch (status) {
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon };
    case 'pending':
    default:
      return { label: 'Taken', Icon: RadioButtonUncheckedIcon };
  }
};


export default function MedicationDetailPopup({
  medicineReminder,
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
          <Profile imageUrl={medicineReminder.pet.image_url} size={50} />
          <div className='pet-info'>
            <div className="pet-name">{medicineReminder.pet.name}</div>
            <div className="pet-id">id: {medicineReminder.pet.id}</div>
          </div>
        </PetSection>

        <MedicineSection>
          <MedicationIcon style={{ color: '#cccccc' }} />
          <div className="medicine-name">{medicineReminder.medicine.name}</div>
          <div className="medicine-dosage">{medicineReminder.medicine.dosage}</div>
        </MedicineSection>

        <ScheduleSection>
          <div className='schedule-title'>Schedule Information</div>
          <div className='px-4'>
            <div className='schedule-info'>
              <div className='info-row'>
                <div className='info-label'>Frequency:</div>
                <div className='info-value'>{medicineReminder.schedule.frequency.label}</div>
              </div>
              <div className='info-row'>
                <div className='info-label'>Times per day:</div>
                <div className='info-value'>{medicineReminder.schedule.measurement_times_per_day}</div>
              </div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Starting date:</div>
              <div className='info-value'>{medicineReminder.schedule.starting_date}</div>
            </div>
          </div>

        </ScheduleSection>

        <RemindersSection >
          <div className="section-title">Today's Reminders</div>
          {medicineReminder.schedule.reminders
            .map((reminder: any) => {
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
                      onClick={() => onToggleReminder(reminder.id, !isTaken)}
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