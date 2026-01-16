import React, { useState } from 'react';
import styled from 'styled-components';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { SelectInput } from '../../shared/form/SelectInput';
import { PrimaryButton } from '../../shared/form/PrimaryButton';
import { Pets, Add, Remove } from '@mui/icons-material';
import { theme } from '@/styles/theme';
import { MedicineReminderVM } from '@/types/medicine-reminder';
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

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

const TopPopup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: ${theme.colors.textPrimary};
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
  status: string;
};

type CreateMedicationPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (medicineReminder: MedicineReminderVM) => void;
  pets: Pet[];
};

export default function CreateMedicationPopup({
  open,
  onClose,
  onSubmit,
  pets
}: CreateMedicationPopupProps) {
  const [petId, setPetId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('everyday');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminders, setReminders] = useState<ReminderTime[]>([
    { id: 'r1', time: '08:00', status: 'pending' }
  ]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const addReminder = () => {
    const newId = `r${reminders.length + 1}`;
    setReminders([...reminders, { id: newId, time: '08:00', status: 'pending' }]);
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

  const handleSubmit = () => {
    if (!petId || !medicineName || !dosage || reminders.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedPet = pets.find(p => p.id === petId);
    if (!selectedPet) {
      alert('Please select a pet');
      return;
    }

    // Generate unique IDs
    const notificationId = `med_${Date.now()}`;
    const medicineId = `medicine_${Date.now()}`;

    const frequencyLabels: Record<string, string> = {
      everyday: 'Everyday',
      twice_daily: 'Twice daily',
      three_times_daily: 'Three times daily',
      custom: 'Custom schedule'
    };

    const newMedicineReminder: MedicineReminderVM = {
      notification_id: notificationId,
      pet: {

        _id: selectedPet.id,
        name: selectedPet.name,
        profile_image: selectedPet.avatarUrl || '/pets-example/pet-ex1.svg',
      },
      medicine: {
        _id: medicineId,
        name: medicineName,
        dosage: dosage,
      },
      schedule: {
        frequency: {
          key: frequency as "everyday" | "interval_hours" | "custom",
          label: frequencyLabels[frequency] || 'Everyday',
        },
        reminders: reminders.map(reminder => ({
          id: reminder.id,
          time: reminder.time,
          is_taken: false,
          status: reminder.status,
        })),
        measurement_times_per_day: reminders.length,
        starting_date: startDate,
      },
      medication_status: {
        is_stopped: false,
      },
    };

    onSubmit?.(newMedicineReminder);

    // Reset form
    setPetId('');
    setMedicineName('');
    setDosage('');
    setFrequency('everyday');
    setStartDate(new Date().toISOString().split('T')[0]);
    setReminders([{ id: 'r1', time: '08:00', status: 'pending' }]);

    onClose();
  };

  const selectedPet = pets.find(p => p.id === petId);

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupCard>
        <TopPopup>
          <Title>Add New Medication</Title>
          <IconButton
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </TopPopup>


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

        <FormField label="Medicine Name" htmlFor="medicine-name-input">
          <TextInput
            id="medicine-name-input"
            value={medicineName}
            onChange={e => setMedicineName(e.target.value)}
            placeholder="e.g., Amoxicillin"
          />
        </FormField>

        <Row>
          <FormField label="Dosage" htmlFor="dosage-input">
            <TextInput
              id="dosage-input"
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              placeholder="e.g., 250mg, 1 tablet"
            />
          </FormField>
          <FormField label="Frequency" htmlFor="frequency-select">
            <SelectInput
              id="frequency-select"
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

        <FormField label="Start Date" htmlFor="start-date-input">
          <TextInput
            id="start-date-input"
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

        <ButtonRow>
          <SecondaryButton onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton size={'md'} style={{ flex: 1 }} onClick={handleSubmit}>
            Add Medication
          </PrimaryButton>
        </ButtonRow>


      </PopupCard>
    </Overlay>
  );
}
