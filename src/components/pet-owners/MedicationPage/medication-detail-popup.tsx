import React from 'react';
import styled from 'styled-components';
import { PrimaryButton } from '../form/PrimaryButton';
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

const Label = styled.div`
  font-weight: 600;
`;

const Detail = styled.div`
  font-weight: 300;
`;

const Row = styled.div`
  display: flex;
  gap: 18px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
`;

const DeleteButton = styled(PrimaryButton)`
  background: #e53935 !important;
  color: #fff !important;
`;

import type { MedicationRecord } from './MedicationPage';

type MedicationDetailPopupProps = {
  open: boolean;
  onClose: () => void;
  record: MedicationRecord | null;
  onEdit: (record: MedicationRecord) => void;
  onDelete: () => void;
};

export default function MedicationDetailPopup({ open, onClose, record, onEdit, onDelete }: MedicationDetailPopupProps) {
  if (!open || !record) return null;

  return (
    <Overlay onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <PopupCard>
        <Title>Medication</Title>
        <PetRow>
          <PetAvatar src={record.avatarUrl || ''} alt={record.petName} />
          <PetInfo>
            <div style={{ fontWeight: 600 }}>{record.petName}</div>
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>PID: 098765345</div>
          </PetInfo>
        </PetRow>
        <div>
            <Label>Medicine Name</Label>
            <Detail>{record.medicationName}</Detail>
        </div>
        <Row>
          <div>
            <Label>Dose/Time</Label>
            <Detail>{record.schedule}</Detail>
          </div>
          <div>
            <Label>Times/Day</Label>
            <Detail>วันละครั้ง</Detail>
          </div>
        </Row>
        <div>
            <Label>Note</Label>
            <Detail>{record.note}</Detail>
        </div>
        <ButtonRow>
          <PrimaryButton size={'md'} style={{ flex: 1 }} onClick={() => onEdit(record)}>Edit</PrimaryButton>
          <DeleteButton size={'md'} style={{ flex: 1 }} onClick={onDelete}>Delete</DeleteButton>
        </ButtonRow>
        <div style={{ position: 'absolute', top: 12, right: 18, cursor: 'pointer', fontSize: 22, color: theme.colors.textPrimary }} onClick={onClose}>×</div>
      </PopupCard>
    </Overlay>
  );
}
