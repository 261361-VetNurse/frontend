import React from 'react';
import { formatTimeForDisplay } from '@/lib/reminder-utils';
import { MedicineReminderVM } from '@/types/medicine-reminder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { MedDetailOverlayStyled, PopupCard, CloseButton, PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton, ActionButton } from '@/styles/medication.styled';
import Profile from '../../shared/Profile';

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
  page,
  onClose,
  onToggleReminder,
  onEdit,
}: MedicationDetailPopupProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatTakenTime = (takenAt?: string) => {
    if (!takenAt) return '';
    const date = new Date(takenAt);
    return `Taken at ${formatTimeForDisplay(
      `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    )}`;
  };

  return (
    <MedDetailOverlayStyled onClick={handleOverlayClick}>
      <PopupCard>
        <CloseButton onClick={onClose}>×</CloseButton>

        <PetSection>
          <Profile imageUrl={medicineReminder.pet.image_url} size={50} />
          <div className='pet-info'>
            <div className="pet-name">{medicineReminder.pet.name}</div>
            <div className="pet-id">id: {medicineReminder.pet.id}</div>
          </div>
        </PetSection>

        <MedicineSection>
          <div className="medicine-name">{medicineReminder.medicine.name}</div>
          <div className="medicine-dosage">{medicineReminder.medicine.dosage}</div>
        </MedicineSection>

        <ScheduleSection>
          <div className='schedule-title'>Schedule Information</div>
          <div className='schedule-info'>
            <div className='info-row'>
              <div className='info-label'>Frequency:</div>
              <div className='info-value'>{medicineReminder.schedule.frequency.label}</div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Times per day:</div>
              <div className='info-value'>{medicineReminder.schedule.measurement_times_per_day}</div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Starting date:</div>
              <div className='info-value'>{new Date(medicineReminder.schedule.starting_date).toLocaleDateString()}</div>
            </div>
          </div>
        </ScheduleSection>

        <RemindersSection >
          <div className="section-title">Today's Reminders</div>
          {medicineReminder.schedule.reminders
            .filter((reminder: any) =>
              // If on medication page, show all.
              // If on home page, only show the highlighted one (if provided).
              page === 'medication-page' || !highlightedReminderId || reminder.id === highlightedReminderId
            )
            .map((reminder: any) => {
              const status = getStatus(reminder);
              const { label, Icon } = getStatusMeta(status);
              const isTaken = status === 'taken';

              return (
                <ReminderItem
                  key={reminder.id}
                  $isHighlighted={reminder.id === highlightedReminderId}
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

        <div className="flex gap-4">
          <ActionButton $variant="secondary" onClick={onClose}>
            Close
          </ActionButton>
          <ActionButton $variant="primary" onClick={onEdit}>
            Edit Medication
          </ActionButton>
        </div>
      </PopupCard>
    </MedDetailOverlayStyled>
  );
}