'use client';

import React from 'react';
import styled from 'styled-components';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// SVG icon wrappers replacing MUI icons
const CheckCircleIcon = ({ style }: { style?: React.CSSProperties }) => (
  <img src="/complete.svg" alt="taken" style={{ width: 16, height: 16, ...style }} />
);
const EditIcon = ({ fontSize }: { fontSize?: string }) => (
  <img src="/edit.svg" alt="edit" style={{ width: fontSize === 'small' ? 18 : 20, height: fontSize === 'small' ? 18 : 20 }} />
);
const DeleteIcon = ({ fontSize, sx }: { fontSize?: string; sx?: React.CSSProperties }) => (
  <img src="/delete.svg" alt="delete" style={{ width: fontSize === 'small' ? 18 : 20, height: fontSize === 'small' ? 18 : 20, ...sx }} />
);
import { theme } from '@/styles/tokens/theme';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { NotificationItem } from '@/types/domain/medication';
import { Profile } from '@/components/shared';

export type OccurrenceStatus = 'pending' | 'taken' | 'missed' | 'sent';

export interface ValidatedTimeSlot {
  id: number; // notification_id
  timeLabel: string;
  status: OccurrenceStatus;
}

export interface TimeSlot {
  id: string; // reminder_id
  timeLabel: string;
  status: OccurrenceStatus;
}

type Props = {
  data: NotificationItem;
  groupedTimes?: ValidatedTimeSlot[];
  onOpenDetail: () => void;

  // Callback now requires reminderId
  onToggleTaken: (reminderId: string | number, nextTaken: boolean) => void;

  onEdit?: () => void;
  onDelete?: () => void;
};

function getStatusMeta(status: OccurrenceStatus) {
  switch (status) {
    case 'sent':
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
  data,
  groupedTimes,
  onOpenDetail,
  onEdit,
  onDelete,
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit?.();
  };

  const handleDeleteAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleMenuClose();
    onDelete?.();
  };

  // Extract data fields from NotificationDetail
  const petName = data.pet_name || 'Unknown Pet';
  const petImageUrl = data.pet_image || undefined;
  const medicineName = data.medicine_name || 'Unknown Medicine';
  const dosage = data.dosage || '';
  const isStopped = false; // NotificationDetail doesn't have a status field for stopped

  // Use groupedTimes if available, otherwise fall back to original logic (though parent should provide groupedTimes now)
  const displayTimes = groupedTimes || (data.reminder_time || []).map((t) => ({
    id: `${data.notification_id}_${t}`,
    timeLabel: t,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: (data.istaken || (data as any).status === 'sent') ? 'taken' : 'pending'
  } as unknown as ValidatedTimeSlot));

  return (
    <Card
      $disabled={isStopped}
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
          <Profile
            alt={petName}
            imageUrl={petImageUrl}
            size="48px"
          />
          <Info>
            <PetName>{petName}</PetName>
            <MedName $disabled={!!isStopped}>{medicineName}</MedName>
            {dosage ? <Dosage $disabled={!!isStopped}>{dosage}</Dosage> : null}
            {isStopped ? <StoppedTag>Stopped</StoppedTag> : null}
          </Info>
        </Left>
        {(onEdit || onDelete) && (
          <>
            <IconButton
              type="button"
              onClick={open ? handleMenuClose : handleMenuClick}
              style={{ padding: 4 }}
            >
              <MoreHorizIcon style={{ color: '#9ca3af' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                style: {
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  minWidth: 160,
                  marginTop: 8
                }
              }}
            >
              <MenuItem onClick={handleEditAction}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeleteAction} sx={{ color: '#ef4444' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </MainRow>

      <Divider />

      <TimesGrid>
        {displayTimes.map((slot) => {
          const { Icon } = getStatusMeta(slot.status);

          return (
            <TimeChip
              key={slot.id}
              $status={slot.status}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(); // Always open detail instead of toggling
              }}
              style={{ cursor: 'pointer' }}
            >
              <Icon style={{ fontSize: 16 }} />
              <div className="time">{slot.timeLabel}</div>
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
    border: 1px solid ${({ $status }) =>
    $status === 'taken' ? `${theme.colors.primary}40` :
      $status === 'missed' ? '#fecaca' : '#e5e7eb'};
    color: ${({ $status }) =>
    $status === 'taken' ? `${theme.colors.primary}` :
      $status === 'missed' ? '#dc2626' : '#374151'};
    font-size: 13px;
    font-weight: 500;
    cursor: default;

    .time {
        font-family: inherit;
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