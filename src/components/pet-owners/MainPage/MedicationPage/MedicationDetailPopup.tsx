import React from 'react';
import styled from 'styled-components';
import { theme } from '@/styles/theme';
import { ReminderOccurrence } from '@/lib/reminder-utils';
import { formatTimeForDisplay } from '@/lib/reminder-utils';
import { MedicineReminderVM } from '@/types/medicine-reminder';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.2);
  padding: 0 16px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopupCard = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  padding: 24px;
  width: 100%;
  max-width: 393px;
  gap: 16px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${theme.colors.textSecondary};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const PetSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const PetAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const PetName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const MedicineSection = styled.div`
  margin-bottom: 16px;
`;

const MedicineName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 4px 0;
`;

const MedicineDosage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const ScheduleSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const ScheduleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: ${theme.colors.textSecondary};
`;

const InfoValue = styled.span`
  color: ${theme.colors.textPrimary};
  font-weight: 500;
`;

const RemindersSection = styled.div`
  margin-bottom: 20px;
`;

const ReminderItem = styled.div<{ $isHighlighted?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: ${props => props.$isHighlighted ? '#E3F2FD' : '#F5F5F5'};
  margin-bottom: 8px;
  border: ${props => props.$isHighlighted ? `2px solid ${theme.colors.primary}` : 'none'};
`;

const ReminderTime = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const ReminderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusButton = styled.button<{ $isTaken: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.$isTaken ? '#4CAF50' : '#FFF3E0'};
  color: ${props => props.$isTaken ? '#fff' : '#F57C00'};
  
  &:hover {
    opacity: 0.8;
  }
`;

const TakenTime = styled.span`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  ${props => props.$variant === 'primary' ? `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
  ` : `
    background-color: #F5F5F5;
    color: ${theme.colors.textPrimary};
  `}
  
  &:hover {
    opacity: 0.8;
  }
`;

interface MedicationDetailPopupProps {
  medicineReminder: MedicineReminderVM;
  highlightedReminderId?: string;
  onClose: () => void;
  onToggleReminder: (reminderId: string, isTaken: boolean) => void;
  onEdit: () => void;
}

export default function MedicationDetailPopup({
  medicineReminder,
  highlightedReminderId,
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
    <Overlay onClick={handleOverlayClick}>
      <PopupCard>
        <CloseButton onClick={onClose}>×</CloseButton>
        
        <PetSection>
          <PetAvatar src={medicineReminder.pet.image_url} alt={medicineReminder.pet.name} />
          <PetName>{medicineReminder.pet.name}</PetName>
        </PetSection>

        <MedicineSection>
          <MedicineName>{medicineReminder.medicine.name}</MedicineName>
          <MedicineDosage>{medicineReminder.medicine.dosage}</MedicineDosage>
        </MedicineSection>

        <ScheduleSection>
          <SectionTitle>Schedule Information</SectionTitle>
          <ScheduleInfo>
            <InfoRow>
              <InfoLabel>Frequency:</InfoLabel>
              <InfoValue>{medicineReminder.schedule.frequency.label}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Times per day:</InfoLabel>
              <InfoValue>{medicineReminder.schedule.measurement_times_per_day}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Starting date:</InfoLabel>
              <InfoValue>{new Date(medicineReminder.schedule.starting_date).toLocaleDateString()}</InfoValue>
            </InfoRow>
          </ScheduleInfo>
        </ScheduleSection>

        <RemindersSection>
          <SectionTitle>Today's Reminders</SectionTitle>
          {medicineReminder.schedule.reminders.map((reminder) => (
            <ReminderItem 
              key={reminder.id} 
              $isHighlighted={reminder.id === highlightedReminderId}
            >
              <ReminderTime>{formatTimeForDisplay(reminder.time)}</ReminderTime>
              <ReminderStatus>
                <StatusButton
                  $isTaken={reminder.is_taken}
                  onClick={() => onToggleReminder(reminder.id, !reminder.is_taken)}
                >
                  {reminder.is_taken ? 'Taken' : 'Not taken'}
                </StatusButton>
                {reminder.is_taken && reminder.taken_at && (
                  <TakenTime>{formatTakenTime(reminder.taken_at)}</TakenTime>
                )}
              </ReminderStatus>
            </ReminderItem>
          ))}
        </RemindersSection>

        <ActionButtons>
          <ActionButton $variant="secondary" onClick={onClose}>
            Close
          </ActionButton>
          <ActionButton $variant="primary" onClick={onEdit}>
            Edit Medication
          </ActionButton>
        </ActionButtons>
      </PopupCard>
    </Overlay>
  );
}