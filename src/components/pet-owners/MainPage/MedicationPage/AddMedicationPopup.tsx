import React, { useState } from 'react';
import styled from 'styled-components';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { SelectInput } from '../../shared/form/SelectInput';
import { PrimaryButton } from '../../shared/form/PrimaryButton';
import { Pets } from '@mui/icons-material';
import { theme } from '@/styles/theme';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PopupCard = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  padding: 24px;
  width: 100%;
  max-width: 400px;
  position: relative;
  gap: 16px;
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
  color: ${theme.colors.textPrimary};
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
`;

const NoteArea = styled.textarea`
  width: 100%;
  min-height: 70px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  font-size: 1rem;
  margin-top: 4px;
  resize: vertical;
`;

type Pet = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type CreateMedicationPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: { petId: string; medName: string; dose: string; times: string; note: string }) => void;
  pets: Pet[];
};

export default function CreateMedicationPopup({ open, onClose, onSubmit , pets}: CreateMedicationPopupProps) {
  const [petId, setPetId] = useState('');
  const [medName, setMedName] = useState('');
  const [dose, setDose] = useState('');
  const [times, setTimes] = useState('');
  const [note, setNote] = useState('');

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupCard>
        <Title>Create Medication</Title>
        <SelectPet>
          <PetIconWrap>
            {petId
              ? (
                  <img
                    src={pets.find((p: Pet) => p.id === petId)?.avatarUrl || ''}
                    alt={pets.find((p: Pet) => p.id === petId)?.name || ''}
                    width={40}
                    height={40}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                )
              : (
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
        
        <FormField label="Medicine Name" htmlFor="med-name-input">
          <TextInput id="med-name-input" value={medName} onChange={e => setMedName(e.target.value)} placeholder="" />
        </FormField>
        <Row>
          <FormField label="Dose/Time" htmlFor="dose-input">
            <TextInput id="dose-input" value={dose} onChange={e => setDose(e.target.value)} />
          </FormField>
          <FormField label="Times/Day" htmlFor="times-input">
            <TextInput id="times-input" value={times} onChange={e => setTimes(e.target.value)} />
          </FormField>
        </Row>
        <FormField label="Note" htmlFor="note-area">
          <NoteArea id="note-area" value={note} onChange={e => setNote(e.target.value)} placeholder="" />
        </FormField>
        <PrimaryButton size={'md'} style={{ width: '100%' }} onClick={() => onSubmit?.({ petId, medName, dose, times, note })}>
          Add New Medication
        </PrimaryButton>
        <div style={{ position: 'absolute', top: 12, right: 18, cursor: 'pointer', fontSize: 22, color: theme.colors.textPrimary }} onClick={onClose}>×</div>
      </PopupCard>
    </Overlay>
  );
}
