import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FormField } from '../../shared/form/FormField';
import { TextInput } from '../../shared/form/TextInput';
import { PrimaryButton } from '../../shared/form/PrimaryButton';
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
`;

const PetRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PetAvatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: #edeef0;
`;

const PetInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  gap: 18px;
`;

const NoteArea = styled.textarea`
  width: 100%;
  min-height: 70px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  font-size: 14px;
  font-weight: 300;
  margin-top: 4px;
  resize: vertical;
`;

type Pet = {
  id: string;
  name: string;
  avatarUrl?: string;
  // add other fields as needed
};

type EditMedicationPopupProps = {
  open: boolean;
  onClose: () => void;
  record: any;
  pets: Pet[];
  onSave: (data: any) => void;
};

export default function EditMedicationPopup({ open, onClose, record, pets, onSave }: EditMedicationPopupProps) {

  const [petId, setPetId] = useState(record?.petId || '');
  const [medName, setMedName] = useState(record?.medicationName || '');
  const [dose, setDose] = useState(record?.schedule || '');
  const [times, setTimes] = useState('วันละครั้ง');
  const [note, setNote] = useState(record?.note || '');

  useEffect(() => {
    setPetId(record?.petId || '');
    setMedName(record?.medicationName || '');
    setDose(record?.schedule || '');
    setNote(record?.note || '');
    // setTimes if you want to support editing times
  }, [record]);

  if (!open || !record) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupCard>
        <Title>Edit Medication</Title>
        <PetRow>
          {pets.find((p: Pet) => p.id === petId)?.avatarUrl ? (
            <PetAvatar
              src={pets.find((p: Pet) => p.id === petId)?.avatarUrl as string}
              alt={pets.find((p: Pet) => p.id === petId)?.name || ''}
            />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#edeef0' }} />
          )}
          <PetInfo>
            <div style={{ fontWeight: 600 }}>{pets.find((p: Pet) => p.id === petId)?.name || ''}</div>
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>PID: 098765345</div>
          </PetInfo>
        </PetRow>
        <FormField label="Medicine Name" htmlFor="medication-name">
          <TextInput id="medication-name" value={medName} onChange={e => setMedName(e.target.value)} />
        </FormField>
        <Row>
          <FormField label="Dose/Time" htmlFor="dose-time">
            <TextInput id="dose-time" value={dose} onChange={e => setDose(e.target.value)}/>
          </FormField>
          <FormField label="Times/Day" htmlFor="times-day">
            <TextInput id="times-day" value={times} onChange={e => setTimes(e.target.value)}/>
          </FormField>
        </Row>
        <FormField label="Note" htmlFor="note-area">
          <NoteArea id="note-area" value={note} onChange={e => setNote(e.target.value)} />
        </FormField>
        <PrimaryButton size={'md'} style={{ width: '100%'}} onClick={() => onSave?.({ petId, medName, dose, times, note })}>
          Save
        </PrimaryButton>
        <div style={{ position: 'absolute', top: 12, right: 18, cursor: 'pointer', fontSize: 22, color: theme.colors.textPrimary }} onClick={onClose}>×</div>
      </PopupCard>
    </Overlay>
  );
}