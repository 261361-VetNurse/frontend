import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { Remove, CheckBox, CheckBoxOutlineBlank, PhotoCamera } from '@mui/icons-material';
const Add = ({ fontSize }: { fontSize?: string }) => (
  <Image width={24} height={24} src="/add-new.svg" alt="add" style={{ width: fontSize === 'small' ? 18 : 24, height: fontSize === 'small' ? 18 : 24 }} />
);
import { theme } from '@/styles/tokens/theme';


import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import { PetLite } from '@/types/domain/pet';
import { createMedicine, authStorage } from '@/services/api/client';
import { AddMedicationPayload } from '@/types/api/medication.dto';
import { scanMedication } from '@/services/api/client';



import Image from '@/components/shared/Image';
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

const ScanningText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${theme.colors.primary};
  font-weight: 500;
  font-size: 14px;
`;

const Dot = styled.span`
  animation: blink 1.4s infinite both;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0% { opacity: 0.2; }
    20% { opacity: 1; }
    100% { opacity: 0.2; }
  }
`;

type ReminderTime = {
  id: string;
  time: string;
  status: string;
};

type CreateMedicationPopupProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  pets: PetLite[];
  initialPetId?: number;
};

export default function CreateMedicationPopup({
  open,
  onClose,
  onSuccess,
  pets,
  initialPetId
}: CreateMedicationPopupProps) {
  const [petId, setPetId] = useState<number | null>(null);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && initialPetId) {
      setPetId(initialPetId);
    }
  }, [open, initialPetId]);


  // Frequency State
  const [isEveryday, setIsEveryday] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0=Mon, 6=Sun

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminders, setReminders] = useState<ReminderTime[]>([
    { id: 'r1', time: '08:00', status: 'pending' }
  ]);

  if (!open) return null;

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

  const handleSubmit = async () => {
    if (!petId || !medicineName || !dosage || reminders.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isEveryday && selectedDays.length === 0) {
      alert('Please select at least one day or choose Everyday');
      return;
    }

    const selectedPet = pets.find(p => String(p.pet_id) === String(petId));
    if (!selectedPet) {
      alert('Please select a pet');
      return;
    }

    // Determine frequency string
    let frequencyVal = '-1';

    if (!isEveryday) {
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      frequencyVal = sortedDays.join(',');
    }

    try {
      const token = authStorage.getToken() || "";

      const payload: AddMedicationPayload = {
        pet_id: selectedPet.pet_id,
        name: medicineName,
        dosage: dosage,
        frequency: frequencyVal,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        reminder_time: reminders.map(r => r.time),
        status: 'TAKE',
        end_date: new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default to 1 week if not specified
      };

      await createMedicine(token, payload);

      alert('Medication created successfully!');
      onSuccess?.();

      // Reset form
      setPetId(0);
      setMedicineName('');
      setDosage('');
      setIsEveryday(true);
      setSelectedDays([]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setReminders([{ id: 'r1', time: '08:00', status: 'pending' }]);

      onClose();
    } catch (err: unknown) {
      console.error(err);
      alert(`Failed to create medication: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleScan = async (file: File) => {
    try {
      setIsScanning(true);

      const token = authStorage.getToken() || "";
      const data = await scanMedication(token, file);

      if (data.name) setMedicineName(data.name);
      if (data.dosage) setDosage(data.dosage);
      if (data.reminder_time?.length) {
        setReminders(
          data.reminder_time.map((time: string, i: number) => ({
            id: `r${i + 1}`,
            time,
            status: "pending",
          }))
        );
      }

      if (data.frequency === "-1") {
        setIsEveryday(true);
        setSelectedDays([]);
      } else if (data.frequency) {
        setIsEveryday(false);
        setSelectedDays(data.frequency.split(",").map(Number));
      }

    } catch (err) {
      console.error(err);
      alert("Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Add New Medication"
      primaryLabel="Add Medication"
      onPrimary={handleSubmit}
      secondaryLabel="Cancel"
      onSecondary={onClose}
    >
      <div className="flex flex-col gap-4">
        <PetFilterSelector
          mode="filter"
          allowAllPets={false}
          pets={pets}
          value={petId || 0}
          onChange={(id) => setPetId(id)}
        />

        <FormField label="Scan Medication">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleScan(e.target.files[0]);
              }
            }}
          />

          <div
            onClick={() => !isScanning && fileInputRef.current?.click()}
            style={{
              width: "100%",
              height: "140px",
              border: "2px dashed #ccc",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isScanning ? "not-allowed" : "pointer",
              backgroundColor: isScanning ? "#f5f5f5" : "#fafafa",
              transition: "0.2s",
              fontSize: "32px",
              opacity: isScanning ? 0.6 : 1
            }}
          >
            {isScanning ? (
              <span style={{ color: theme.colors.primary, fontWeight: 500 }}>
                <ScanningText>
                  Scanning
                  <Dot>.</Dot>
                  <Dot>.</Dot>
                  <Dot>.</Dot>
                </ScanningText>
              </span>
            ) : (
              <>
                <PhotoCamera
                  sx={{
                    fontSize: 42,
                    color: theme.colors.primary
                  }}
                />
                <span
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: theme.colors.primary,
                    fontWeight: 500
                  }}
                >
                  Tap to scan
                </span>
              </>
            )}
          </div>
        </FormField>

        <Row>
          <FormField label="Medicine Name" htmlFor="medicine-name-input">
            <TextInput
              id="medicine-name-input"
              value={medicineName}
              onChange={e => setMedicineName(e.target.value)}
              placeholder="e.g., Amoxicillin"
            />
          </FormField>
          <FormField label="Dosage" htmlFor="dosage-input">
            <TextInput
              id="dosage-input"
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
      </div>
    </FormDialog>
  );
}
