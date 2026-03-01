/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { FormField } from "../../../shared/form/FormField";
import { TextInput } from "../../../shared/form/TextInput";
import { PrimaryButton } from "../../../shared/form/PrimaryButton";
import Image from '@/components/shared/Image';
const Pets = ({ style }: { style?: React.CSSProperties }) => (
  <Image src="/pet-paw.svg" alt="pet" style={{ width: 40, height: 40, ...style }} />
);
import { theme } from "@/styles/tokens/theme";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
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

const PetRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PetAvatarWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: #edeef0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PetAvatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PetInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export type PetLite = {
  id: string;
  name: string;
  pid?: string;
  avatarUrl?: string;
};

export type MedicationEditRecord = {
  id: string;
  medicationName: string;
  dose: string;
  times: string;
  note?: string;
};

export type EditMedicationPayload = {
  id: string;
  medicationName: string;
  dose: string;
  times: string;
  note: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  record: MedicationEditRecord | null;
  pet: PetLite;
  onSave?: (data: EditMedicationPayload) => void;
};

export default function EditMedicationPopupV2({
  open,
  onClose,
  record,
  pet,
  onSave,
}: Props) {
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !record) return;
    setMedName(record.medicationName ?? "");
    setDose(record.dose ?? "");
    setTimes(record.times ?? "");
    setNote(record.note ?? "");
  }, [open, record]);

  const canSubmit = useMemo(() => {
    return Boolean(record?.id && medName.trim() && dose.trim() && times.trim());
  }, [record?.id, medName, dose, times]);

  if (!open || !record) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  function handleSubmit() {
    if (!record) return;
    if (!canSubmit) return;
    onSave?.({
      id: record.id,
      medicationName: medName.trim(),
      dose: dose.trim(),
      times: times.trim(),
      note: note.trim(),
    });
    onClose();
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupCard>
        <Title>Edit Medication</Title>

        {/* Pets row only */}
        <PetRow>
          <PetAvatarWrap>
            {pet.avatarUrl ? (
              <PetAvatar src={pet.avatarUrl} alt={pet.name} />
            ) : (
              <Pets style={{ fontSize: 40, color: "#888" }} />
            )}
          </PetAvatarWrap>

          <PetInfo>
            <div style={{ fontWeight: 600 }}>{pet.name}</div>
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              PID: {pet.pid ?? "-"}
            </div>
          </PetInfo>
        </PetRow>

        <FormField label="Medicine Name" htmlFor="medication-name">
          <TextInput
            id="medication-name"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
          />
        </FormField>

        <Row>
          <FormField label="Dose/Time" htmlFor="dose-time">
            <TextInput
              id="dose-time"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
          </FormField>

          <FormField label="Times/Day" htmlFor="times-day">
            <TextInput
              id="times-day"
              value={times}
              onChange={(e) => setTimes(e.target.value)}
            />
          </FormField>
        </Row>

        <FormField label="Note" htmlFor="note-area">
          <NoteArea
            id="note-area"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </FormField>

        <PrimaryButton
          style={{ width: "100%", opacity: canSubmit ? 1 : 0.6 }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Save Changes
        </PrimaryButton>

        <div
          style={{
            position: "absolute",
            top: 12,
            right: 18,
            cursor: "pointer",
            fontSize: 22,
            color: theme.colors.textPrimary,
          }}
          onClick={onClose}
        >
          ×
        </div>
      </PopupCard>
    </Overlay>
  );
}
