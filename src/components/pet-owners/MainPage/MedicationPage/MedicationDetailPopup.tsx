/* eslint-disable react-hooks/set-state-in-effect */
import { formatTimeForDisplay } from '@/utils/reminder-utils';
import { ReminderSlot } from '@/types/domain/medication';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PetSection, MedicineSection, ScheduleSection, RemindersSection, ReminderItem, StatusButton } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import { getMedicationStatus } from '@/utils/medicationStatus';
import React, { useState, useEffect } from 'react';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import Image from '@/components/shared/Image';
// SVG icon wrappers replacing MUI icons
const CheckCircleIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Image width={24} height={24} src="/complete.svg" alt="taken" style={{ width: 16, height: 16, ...style }} />
);
const MedicationIcon = ({ style }: { style?: React.CSSProperties }) => (
  <Image width={24} height={24} src="/medication.svg" alt="medication" style={{ width: 24, height: 24, ...style }} />
);

interface MedicationDetailPopupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicineReminder: any;
  occurrences: ReminderSlot[]; // Strongly typed now
  highlightedReminderId?: number;
  page: 'home-page' | 'medication-page';
  onClose: () => void;
  onToggleReminder: (reminderId: number) => void;
  onEdit: () => void;
}

type OccurrenceStatus = 'pending' | 'taken' | 'missed';

const getStatusMeta = (status: OccurrenceStatus) => {
  switch (status) {
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon };
    case 'pending':
    default:
      return { label: 'Take', Icon: RadioButtonUncheckedIcon };
  }
};

export const getFrequencyLabel = (freq: string | number): string => {
  const freqString = String(freq).toLowerCase().trim();
  if (!freqString) return '';

  return freqString.split(',').map((f) => {
    const trimmed = f.trim();
    switch (trimmed) {
      case '-1':
      case 'everyday':
        return 'Everyday';
      case '0': return 'Mon';
      case '1': return 'Tue';
      case '2': return 'Wed';
      case '3': return 'Thu';
      case '4': return 'Fri';
      case '5': return 'Sat';
      case '6': return 'Sun';
      default: return trimmed;
    }
  }).join(', ');
};

export default function MedicationDetailPopup({
  medicineReminder,
  occurrences,
  onClose,
  onToggleReminder,
  onEdit,
}: MedicationDetailPopupProps) {
  // Local state for optimistic updates
  const [localOccurrences, setLocalOccurrences] = useState<ReminderSlot[]>([]);

  useEffect(() => {
    if (occurrences) {
      setLocalOccurrences(occurrences);
    } else if (medicineReminder.reminder_time) {
      // Fallback if occurrences is missing (e.g. from Home Page deep link where grouping might be different)
      // Ideally Home Page should also pass formatted occurrences.
      // For now, mapping reminder_time to slots
      const slots = medicineReminder.reminder_time.map((t: string) => ({
        notification_id: medicineReminder.notification_id, // This is wrong if multiple times, but fallback
        time: t,
        status: 'pending', // Default fallback
        taken_at: undefined
      }));
      setLocalOccurrences(slots);
    }
  }, [occurrences, medicineReminder]);

  const handleToggle = (id: number) => {
    // Optimistic Update
    setLocalOccurrences(prev => prev.map(occ =>
      occ.notification_id === id
        ? { ...occ, status: 'taken', taken_at: new Date().toISOString() }
        : occ
    ));

    // Trigger API call
    onToggleReminder(id);
  };

  const formatTakenTime = (takenAt?: string) => {
    if (!takenAt) return '';
    const date = dayjs.utc(takenAt).local();
    return `Taken at ${formatTimeForDisplay(
      `${date.hour().toString().padStart(2, '0')}:${date.minute().toString().padStart(2, '0')}`
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
                <div className='info-value'>{localOccurrences.length}</div>
              </div>
            </div>
            <div className='info-row'>
              <div className='info-label'>Starting date:</div>
              <div className='info-value'>{medicineReminder.created_at || medicineReminder.start_date}</div>
            </div>
          </div>

        </ScheduleSection>

        <RemindersSection >
          <div className="section-title">Today&apos;s Reminders</div>
          {localOccurrences.map((reminder) => {
            // Use utility for status if not explicitly taken
            // If API says 'taken', trust it. If not, calculate pending/missed based on time.
            let status: OccurrenceStatus = reminder.status === 'taken' ? 'taken' : 'pending';
            if (status !== 'taken') {
              // Calculate if missed
              const calculated = getMedicationStatus(reminder.time, false, new Date());
              // getMedicationStatus returns 'pending' | 'missed' | 'taken'
              status = calculated as OccurrenceStatus;
            }

            const { label, Icon } = getStatusMeta(status);
            const isTaken = status === 'taken';

            return (
              <ReminderItem
                key={reminder.notification_id}
              >
                <div className='reminder-time'>{formatTimeForDisplay(reminder.time)}</div>

                <div className='reminder-status'>
                  <StatusButton
                    $status={status}
                    onClick={() => !isTaken && handleToggle(reminder.notification_id)}
                    title={label}
                    disabled={isTaken}
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