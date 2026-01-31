import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';

import { theme } from '@/styles/tokens/theme';
import { MedicineReminderVM } from '@/types/domain/medication';
import { Add, Remove, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import type { Pet } from '@/types/domain/pet';

const DaySelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DayButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-start;
`;

const EverydayContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: fit-content;
  
  &:hover {
    opacity: 0.8;
  }
`;

const EverydayText = styled.span<{ $selected: boolean }>`
  font-size: 14px;
  color: ${props => props.$selected ? theme.colors.primary : theme.colors.textPrimary};
  font-weight: 500;
`;

const DayButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${props => props.$selected ? theme.colors.primary : '#e0e0e0'};
  background-color: ${props => props.$selected ? theme.colors.primary : 'transparent'};
  color: ${props => props.$selected ? '#fff' : theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.$selected ? theme.colors.primary : '#f5f5f5'};
  }
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
  onSuccess: () => void;
};

export default function EditMedicationPopup({
  open,
  onClose,
  medicineReminder,
  pets,
  onSuccess
}: EditMedicationPopupProps) {
  const [petId, setPetId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');

  // Frequency State
  const [isEveryday, setIsEveryday] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Mon, 6=Sun

  const [startDate, setStartDate] = useState('');
  const [reminders, setReminders] = useState<ReminderTime[]>([]);
  const [isStopped, setIsStopped] = useState(false);
  const [stopReason, setStopReason] = useState('');

  useEffect(() => {
    if (medicineReminder) {
      setPetId(medicineReminder.pet?._id || '');
      setMedicineName(medicineReminder.medicine?.name || '');
      setDosage(medicineReminder.medicine?.dosage || '');

      // Parse frequency
      const freqKey = medicineReminder.schedule?.frequency?.key as string;
      if (freqKey === 'everyday' || freqKey === '-1') {
        setIsEveryday(true);
        setSelectedDays([]);
      } else {
        // Try to parse "0,1,2"
        const parts = freqKey.split(',').map(s => parseInt(s.trim()));
        if (parts.some(isNaN)) {
          // Fallback if key says "custom" but no days, or unparseable
          setIsEveryday(true);
          setSelectedDays([]);
        } else {
          setIsEveryday(false);
          setSelectedDays(parts);
        }
      }

      setStartDate(medicineReminder.schedule?.starting_date || '');
      setReminders(medicineReminder.schedule?.reminders?.map(r => ({
        id: r.id,
        time: r.time,
        is_taken: false,
        taken_at: undefined,
        status: r.status,
      })) || []);
      setIsStopped(medicineReminder.medication_status?.is_stopped || false);
      setStopReason(medicineReminder.medication_status?.reason || '');
    }
  }, [medicineReminder]);

  if (!open || !medicineReminder) return null;



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

  const handleDayToggle = (dayIndex: number) => {
    if (isEveryday) {
      setIsEveryday(false);
      setSelectedDays([dayIndex]);
    } else {
      let newDays: number[];
      if (selectedDays.includes(dayIndex)) {
        newDays = selectedDays.filter(d => d !== dayIndex);
      } else {
        newDays = [...selectedDays, dayIndex];
      }

      // If all days are selected, toggle back to everyday
      if (newDays.length === 7) {
        setIsEveryday(true);
        setSelectedDays([]);
      } else if (newDays.length === 0) {
        // If no days selected, toggle back to everyday
        setIsEveryday(true);
        setSelectedDays([]);
      } else {
        setSelectedDays(newDays);
      }
    }
  };

  const handleEverydayClick = () => {
    setIsEveryday(true);
    setSelectedDays([]);
  };

  const handleSave = async () => {
    if (!petId || !medicineName || !dosage || reminders.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (isStopped && !stopReason.trim()) {
      alert('Please provide a reason for stopping the medication.');
      return;
    }

    const selectedPet = pets.find(p => p._id === petId);
    if (!selectedPet) {
      alert('Please select a valid pet');
      return;
    }

    if (!isEveryday && selectedDays.length === 0) {
      alert('Please select at least one day or choose Everyday');
      return;
    }

    // Generate frequency string
    let frequencyVal = '-1';

    if (!isEveryday) {
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      frequencyVal = sortedDays.join(',');
    }

    try {
      // Simulate API call with console.log instead of actual API request
      console.log('[MOCK] Editing medication with payload:', {
        notification_id: medicineReminder.notification_id,
        medicine_id: medicineReminder.medicine._id,
        pet_id: selectedPet._id,
        name: medicineName,
        dosage: dosage,
        frequency: frequencyVal,
        starting_date: startDate,
        reminders: reminders.map(r => r.time),
        is_stopped: isStopped,
        reason: isStopped ? stopReason : undefined
      });

      // Simulate success
      alert('Medication updated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to update medication: ${err.message}`);
    }
  };

  const selectedPet = pets.find(p => p._id === petId);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Edit Medication"
      primaryLabel="Save Changes"
      onPrimary={handleSave}
      secondaryLabel="Cancel"
      onSecondary={onClose}
    >
      <div className="flex flex-col gap-4">
        <PetFilterSelector
          mode="filter"
          allowAllPets={false}
          pets={pets}
          value={petId}
          onChange={(id) => setPetId(String(id))}
        />

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
        </Row>
        <FormField label={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span>Frequency</span>
            <span style={{ fontSize: '13px', color: theme.colors.primary, fontWeight: 500 }}>
              {isEveryday
                ? 'Everyday'
                : selectedDays.length > 0
                  ? selectedDays
                    .sort((a, b) => a - b)
                    .map(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d])
                    .join(', ')
                  : 'Select days'}
            </span>
          </div>
        } htmlFor="frequency-select">
          <DaySelectorContainer>
            <EverydayContainer onClick={handleEverydayClick}>
              {isEveryday ? (
                <CheckBox style={{ color: theme.colors.primary }} />
              ) : (
                <CheckBoxOutlineBlank style={{ color: '#ccc' }} />
              )}
              <EverydayText $selected={isEveryday}>Everyday</EverydayText>
            </EverydayContainer>
            <DayButtonRow>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <DayButton
                  key={day}
                  $selected={!isEveryday && selectedDays.includes(index)}
                  onClick={() => handleDayToggle(index)}
                >
                  {day}
                </DayButton>
              ))}
            </DayButtonRow>
          </DaySelectorContainer>
        </FormField>

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
      </div>
    </FormDialog>
  );
}