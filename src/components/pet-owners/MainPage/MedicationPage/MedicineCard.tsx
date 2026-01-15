'use client';

import React from 'react';
import styled from 'styled-components';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { theme } from '@/styles/theme';

export type OccurrenceStatus = 'pending' | 'taken' | 'missed';

export interface TimeSlot {
  id: string; // reminder_id
  timeLabel: string;
  status: OccurrenceStatus;
}

type Props = {
  petName: string;
  petImageUrl?: string;
  medicineName: string;
  dosage?: string;

  // New prop: list of times
  times: TimeSlot[];

  isStopped?: boolean;
  onOpenDetail: () => void;

  // Callback now requires reminderId
  onToggleTaken: (reminderId: string, nextTaken: boolean) => void;

  onEdit?: () => void;
};

function getStatusMeta(status: OccurrenceStatus) {
  switch (status) {
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon, color: theme.colors.primary };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon, color: '#ef4444' };
    case 'pending':
    default:
      return { label: 'Pending', Icon: RadioButtonUncheckedIcon, color: '#e5e7eb' }; // Gray for pending frame
  }
}

export default function MedicineCard({
  petName,
  petImageUrl,
  medicineName,
  dosage,
  times,
  isStopped,
  onOpenDetail,
  onToggleTaken,
  onEdit,
}: Props) {
  return (
    <Card
      $disabled={!!isStopped}
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpenDetail();
      }}
      aria-label={`${petName} ${medicineName}`}
    >
      <MainRow>
        <Left>
          <Avatar src={petImageUrl || '/Ava.svg'} alt={petName} />
          <Info>
            <PetName>{petName}</PetName>
            <MedName $disabled={!!isStopped}>{medicineName}</MedName>
            {dosage ? <Dosage $disabled={!!isStopped}>{dosage}</Dosage> : null}
            {isStopped ? <StoppedTag>Stopped</StoppedTag> : null}
          </Info>
        </Left>
        {onEdit && (
          <IconButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={{ padding: 4 }}
          >
            <MoreHorizIcon style={{ color: '#9ca3af' }} />
          </IconButton>
        )}
      </MainRow>

      <Divider />

      <TimesGrid>
        {times.map((slot) => {
          const isTaken = slot.status === 'taken';
          const { label, Icon, color } = getStatusMeta(slot.status);

          return (
            <TimeChip
              key={slot.id}
              $status={slot.status}
              onClick={(e) => {
                e.stopPropagation();
                if (!isStopped) onToggleTaken(slot.id, !isTaken);
              }}
            >
              <div className="time">{slot.timeLabel}</div>
              <Icon style={{ width: 16, height: 16 }} />
            </TimeChip>
          );
        })}
      </TimesGrid>
    </Card>
  );
}

const Card = styled.div<{ $disabled: boolean }>`
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border: 1px solid #f3f4f6;
  transition: transform 0.1s;
  
  &:active {
    transform: scale(0.995);
  }
`;

const MainRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  object-fit: cover;
  flex: 0 0 auto;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PetName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 2px;
`;

const MedName = styled.div<{ $disabled: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $disabled }) => ($disabled ? '#6b7280' : '#111827')};
  line-height: 1.3;
`;

const Dosage = styled.div<{ $disabled: boolean }>`
  font-size: 13px;
  color: ${({ $disabled }) => ($disabled ? '#9ca3af' : '#6b7280')};
  margin-top: 2px;
`;

const StoppedTag = styled.div`
  margin-top: 6px;
  display: inline-flex;
  width: fit-content;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: #f3f4f6;
  color: #4b5563;
`;

const Divider = styled.div`
    height: 1px;
    background: #f3f4f6;
    width: 100%;
`;

const TimesGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const TimeChip = styled.div<{ $status: OccurrenceStatus }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: ${({ $status }) =>
    $status === 'taken' ? '#eef2ff' :
      $status === 'missed' ? '#fef2f2' : '#f9fafb'};
    border: 1px solid ${({ $status }) =>
    $status === 'taken' ? '#c7d2fe' :
      $status === 'missed' ? '#fecaca' : '#e5e7eb'};
    color: ${({ $status }) =>
    $status === 'taken' ? '#4f46e5' :
      $status === 'missed' ? '#dc2626' : '#374151'};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    .time {
        font-family: inherit;
    }

    &:hover {
        filter: brightness(0.97);
    }
`;

const IconButton = styled.button`
  border: none;
  background: transparent;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;