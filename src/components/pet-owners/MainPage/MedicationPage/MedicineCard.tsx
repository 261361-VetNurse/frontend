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

type Props = {
  petName: string;
  petImageUrl?: string;
  medicineName: string;
  dosage?: string;
  timeLabel: string;

  status: OccurrenceStatus;       // ✅ เปลี่ยนจาก isTaken
  isStopped?: boolean;

  onOpenDetail: () => void;

  // ยังใช้แบบเดิมได้: toggle taken / not-taken (pending/missed ถือว่า not-taken)
  onToggleTaken?: (nextTaken: boolean) => void;

  onEdit?: () => void;
};

function getStatusMeta(status: OccurrenceStatus) {
  switch (status) {
    case 'taken':
      return { label: 'Taken', Icon: CheckCircleIcon };
    case 'missed':
      return { label: 'Missed', Icon: ErrorOutlineIcon };
    case 'pending':
    default:
      return { label: 'Pending', Icon: RadioButtonUncheckedIcon };
  }
}

export default function MedicineCard({
  petName,
  petImageUrl,
  medicineName,
  dosage,
  timeLabel,
  status,
  isStopped,
  onOpenDetail,
  onToggleTaken,
  onEdit,
}: Props) {
  const isTaken = status === 'taken';
  const { label, Icon } = getStatusMeta(status);

  return (
    <Card
      $disabled={!!isStopped}
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpenDetail();
      }}
      aria-label={`${petName} ${medicineName} ${timeLabel} ${label}`}
    >
      <Left>
        <Avatar src={petImageUrl || '/Ava.svg'} alt={petName} />
        <Info>
          <TopRow>
            <Time>{timeLabel}</Time>
          </TopRow>

          <MedName $disabled={!!isStopped}>{medicineName}</MedName>
          {dosage ? <Dosage $disabled={!!isStopped}>{dosage}</Dosage> : null}
          {isStopped ? <StoppedTag>Stopped</StoppedTag> : null}
        </Info>
      </Left>

      <Right>
        {onToggleTaken ? (
          <IconButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isStopped) onToggleTaken(!isTaken);
            }}
            aria-label={isTaken ? 'Mark as not taken' : 'Mark as taken'}
            disabled={!!isStopped}
            title={label}
          >
            <Icon />
          </IconButton>
        ) : (
          <StatusWrap aria-label={label} title={label}>
            <Icon />
          </StatusWrap>
        )}
      </Right>
    </Card>
  );
}

const Card = styled.div<{ $disabled: boolean }>`
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  object-fit: cover;
  flex: 0 0 auto;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const PetName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Time = styled.div`
  font-size: 12px;
  color: #6b7280;
  flex: 0 0 auto;
`;

const MedName = styled.div<{ $disabled: boolean }>`
  margin-top: 2px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $disabled }) => ($disabled ? '#6b7280' : '#111827')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Dosage = styled.div<{ $disabled: boolean }>`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ $disabled }) => ($disabled ? '#9ca3af' : '#6b7280')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StoppedTag = styled.div`
  margin-top: 6px;
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
`;

const StatusWrap = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const IconButton = styled.button`
  border: none;
  background: transparent;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  color: ${theme.colors.primary};

  svg {
    width: 36px;
    height: 36px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
