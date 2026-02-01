import React from 'react';
import { Appointment } from '@/types/domain/appointment';
import { PetSection } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import styled from 'styled-components';
import { theme } from '@/styles/tokens/theme';

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  
  .label {
    font-size: 12px;
    color: ${theme.colors.textSecondary};
  }
  
  .value {
    font-size: 16px;
    font-weight: 500;
    color: ${theme.colors.textPrimary};
  }
`;

interface AppointmentDetailPopupProps {
    appointment: Appointment;
    petImageUrl?: string;
    onClose: () => void;
    onEdit?: () => void;
}

export default function AppointmentDetailPopup({
    appointment,
    petImageUrl,
    onClose,
    onEdit,
}: AppointmentDetailPopupProps) {
    return (
        <FormDialog
            open={true}
            onClose={onClose}
            title="Appointment Detail"
            primaryLabel="Edit Appointment"
            onPrimary={onEdit || (() => { })} // Fallback if onEdit is not provided
        >
            <div className='flex flex-col gap-4'>
                {/* Pet Section reusing styled component from medication */}
                <PetSection>
                    <Profile imageUrl={petImageUrl || "/pets-example/pet-ex1.svg"} size={50} />
                    <div className='pet-info'>
                        <div className="pet-name">{appointment.petName}</div>
                        <div className="pet-id">id: {appointment.petId}</div>
                    </div>
                </PetSection>

                <InfoSection>
                    <InfoRow>
                        <CalendarTodayIcon sx={{ color: theme.colors.primary }} />
                        <InfoText>
                            <span className="label">Date</span>
                            <span className="value">{appointment.date}</span>
                        </InfoText>
                    </InfoRow>

                    <InfoRow>
                        <AccessTimeIcon sx={{ color: theme.colors.primary }} />
                        <InfoText>
                            <span className="label">Time</span>
                            <span className="value">{appointment.time}</span>
                        </InfoText>
                    </InfoRow>

                    <InfoRow>
                        <LocationOnIcon sx={{ color: theme.colors.primary }} />
                        <InfoText>
                            <span className="label">Location</span>
                            <span className="value">{appointment.location}</span>
                        </InfoText>
                    </InfoRow>

                    <InfoRow>
                        <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: appointment.status === 'upcoming' ? '#4CAF50' : '#9E9E9E'
                            }} />
                        </div>
                        <InfoText>
                            <span className="label">Status</span>
                            <span className="value" style={{ textTransform: 'capitalize' }}>{appointment.status}</span>
                        </InfoText>
                    </InfoRow>
                </InfoSection>
            </div>
        </FormDialog>
    );
}
