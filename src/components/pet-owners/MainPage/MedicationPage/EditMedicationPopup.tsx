import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { SelectInput } from '../../shared/form/SelectInput';
import { PrimaryButton } from '../../shared/form/PrimaryButton';
import { theme } from '@/styles/theme';
import { MedicineReminderVM } from '@/types/medicine-reminder';
import { Add, Remove, Pets } from '@mui/icons-material';

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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  padding: 24px;
  width: 100%;
  max-width: 393px;
  position: relative;
  gap: 16px;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.textPrimary};
  max-height: 90vh;
  overflow-y: auto;
`;

const SelectPet = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const PetIconWrap = styled.div`
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  border-radius: 50%;
  background: #edeef0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
`;

const RemindersSection = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 8px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 12px 0;
`;

const ReminderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const TimeInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #ffebee;
  }
`;

const AddReminderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px dashed ${theme.colors.primary};
  background: none;
  color: ${theme.colors.primary};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #E3F2FD;
  }
`;

const StatusSection = styled.div`
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 8px;
`;

const StatusOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusOption = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid ${props => props.$isSelected ? theme.colors.primary : '#e0e0e0'};
  background-color: ${props => props.$isSelected ? '#E3F2FD' : '#fff'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const StatusRadio = styled.input`
  margin: 0;
`;

const StatusLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const StatusDescription = styled.span`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-left: auto;
`;

const ReasonInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 8px;
  font-size: 14px;
  margin-top: 8px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  color: ${theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

type Pet = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type ReminderTime = {
  id: string;
  time: string;
  is_taken: boolean;
  status: string;
  taken_at?: string;
};

type EditMedicationPopupProps = {
  open: boolean;
  onClose: () => void;
  medicineReminder?: MedicineReminderVM;
  pets: Pet[];
  onSave: (data: {
    medicineReminder: MedicineReminderVM;
    isStopped: boolean;
    reason?: string;
  }) => void;
};

export default function EditMedicationPopup({
  open,
  onClose,
  medicineReminder,
  pets,
  onSave
}: EditMedicationPopupProps) {
  const [petId, setPetId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('everyday');
  const [startDate, setStartDate] = useState('');
  const [reminders, setReminders] = useState<ReminderTime[]>([]);
  const [isStopped, setIsStopped] = useState(false);
  const [stopReason, setStopReason] = useState('');

  useEffect(() => {
    if (medicineReminder) {
      setPetId(medicineReminder.pet._id);
      setMedicineName(medicineReminder.medicine.name);
      setDosage(medicineReminder.medicine.dosage);
      setFrequency(medicineReminder.schedule.frequency.key);
      setStartDate(medicineReminder.schedule.starting_date);
      setReminders(medicineReminder.schedule.reminders.map(r => ({
        id: r.id,
        time: r.time,
        is_taken: false,
        taken_at: undefined,
        status: r.status,
      })));
      setIsStopped(medicineReminder.medication_status.is_stopped);
      setStopReason(medicineReminder.medication_status.reason || '');
    }
  }, [medicineReminder]);

  if (!open || !medicineReminder) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const addReminder = () => {
    const newId = `r${Date.now()}`;
    setReminders([...reminders, {
      id: newId,
      time: '08:00',
      is_taken: false,
      status: 'pending',
    }]);
  };

  const removeReminder = (id: string) => {
    if (reminders.length > 1) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };

  const updateReminderTime = (id: string, time: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, time } : r
    ));
  };

  const handleSave = () => {
    if (!petId || !medicineName || !dosage || reminders.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (isStopped && !stopReason.trim()) {
      alert('Please provide a reason for stopping the medication.');
      return;
    }

    const selectedPet = pets.find(p => p.id === petId);
    if (!selectedPet) {
      alert('Please select a valid pet');
      return;
    }

    const frequencyLabels: Record<string, string> = {
      everyday: 'Everyday',
      twice_daily: 'Twice daily',
      three_times_daily: 'Three times daily',
      custom: 'Custom schedule'
    };

    const updatedMedicineReminder: MedicineReminderVM = {
      ...medicineReminder,
      pet: {
        _id: selectedPet.id,
        name: selectedPet.name,
        profile_image: selectedPet.avatarUrl || medicineReminder.pet.profile_image,
      },
      medicine: {
        ...medicineReminder.medicine,
        name: medicineName,
        dosage: dosage,
      },
      schedule: {
        ...medicineReminder.schedule,
        frequency: {
          key: frequency as "everyday" | "interval_hours" | "custom",
          label: frequencyLabels[frequency] || 'Everyday',
        },
        reminders: reminders.map(reminder => ({
          id: reminder.id,
          time: reminder.time,
          is_taken: reminder.is_taken,
          status: reminder.status,
          taken_at: reminder.taken_at,
        })),
        measurement_times_per_day: reminders.length,
        starting_date: startDate,
      },
    };

    onSave({
      medicineReminder: updatedMedicineReminder,
      isStopped,
      reason: isStopped ? stopReason : undefined,
    });
  };

  const selectedPet = pets.find(p => p.id === petId);

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupCard>
        <Title>Edit Medication</Title>

        <SelectPet>
          <PetIconWrap>
            {selectedPet?.avatarUrl ? (
              <img
                src={selectedPet.avatarUrl}
                alt={selectedPet.name}
                width={40}
                height={40}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Pets style={{ fontSize: 40, color: '#888' }} />
            )}
          </PetIconWrap>
          <FormField label="Pet" htmlFor="pet-select">
            <SelectInput
              id="pet-select"
              value={petId}
              onChange={e => setPetId(e.target.value)}
              options={[
                { value: '', label: 'Select your pet' },
                ...pets.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
          </FormField>
        </SelectPet>

        <FormField label="Medicine Name" htmlFor="medication-name">
          <TextInput
            id="medication-name"
            value={medicineName}
            onChange={e => setMedicineName(e.target.value)}
            placeholder="e.g., Amoxicillin"
          />
        </FormField>

        <Row>
          <FormField label="Dosage" htmlFor="dosage">
            <TextInput
              id="dosage"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g., 250mg, 1 tablet"
            />
          </FormField>
          <FormField label="Frequency" htmlFor="frequency">
            <SelectInput
              id="frequency"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              options={[
                { value: 'everyday', label: 'Everyday' },
                { value: 'twice_daily', label: 'Twice daily' },
                { value: 'three_times_daily', label: 'Three times daily' },
                { value: 'custom', label: 'Custom' }
              ]}
            />
          </FormField>
        </Row>

        <FormField label="Start Date" htmlFor="start-date">
          <TextInput
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </FormField>

        <RemindersSection>
          <SectionTitle>Reminder Times</SectionTitle>
          {reminders.map((reminder, index) => (
            <ReminderItem key={reminder.id}>
              <span style={{ minWidth: '60px', fontSize: '14px', color: theme.colors.textSecondary }}>
                Time {index + 1}:
              </span>
              <TimeInput
                type="time"
                value={reminder.time}
                onChange={e => updateReminderTime(reminder.id, e.target.value)}
              />
              <span style={{
                fontSize: '12px',
                color: reminder.is_taken ? '#4CAF50' : theme.colors.textSecondary,
                minWidth: '60px'
              }}>
                {reminder.is_taken ? 'Taken' : 'Pending'}
              </span>
              {reminders.length > 1 && (
                <RemoveButton onClick={() => removeReminder(reminder.id)}>
                  <Remove fontSize="small" />
                </RemoveButton>
              )}
            </ReminderItem>
          ))}

          <AddReminderButton onClick={addReminder}>
            <Add fontSize="small" />
            Add Another Time
          </AddReminderButton>
        </RemindersSection>

        <StatusSection>
          <SectionTitle>Medication Status</SectionTitle>
          <StatusOptions>
            <StatusOption $isSelected={!isStopped}>
              <StatusRadio
                type="radio"
                name="medicationStatus"
                checked={!isStopped}
                onChange={() => setIsStopped(false)}
              />
              <StatusLabel>Active</StatusLabel>
              <StatusDescription>Continue medication schedule</StatusDescription>
            </StatusOption>

            <StatusOption $isSelected={isStopped}>
              <StatusRadio
                type="radio"
                name="medicationStatus"
                checked={isStopped}
                onChange={() => setIsStopped(true)}
              />
              <StatusLabel>Stopped</StatusLabel>
              <StatusDescription>Discontinue medication</StatusDescription>
            </StatusOption>
          </StatusOptions>

          {isStopped && (
            <div>
              <FormField label="Reason for stopping (required)" htmlFor="stop-reason">
                <ReasonInput
                  id="stop-reason"
                  value={stopReason}
                  onChange={e => setStopReason(e.target.value)}
                  placeholder="Please provide a reason for stopping this medication..."
                />
              </FormField>
            </div>
          )}
        </StatusSection>

        <ButtonRow>
          <SecondaryButton onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton size={'md'} style={{ flex: 1 }} onClick={handleSave}>
            Save Changes
          </PrimaryButton>
        </ButtonRow>

        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 18,
            cursor: 'pointer',
            fontSize: 22,
            color: theme.colors.textPrimary
          }}
          onClick={onClose}
        >
          ×
        </div>
      </PopupCard>
    </Overlay>
  );
}