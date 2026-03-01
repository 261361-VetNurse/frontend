import React from 'react';
import { Appointment } from '@/types/domain/appointment';
import { PetSection } from '@/styles/components/medication.styled';
import Profile from '../../shared/Profile';
import { FormDialog } from '@/components/pet-owners/shared/FormDialog';
// SVG icon wrappers replacing MUI icons
const LocationOnIcon = ({ sx }: { sx?: object }) => (
    <img src="/location.svg" alt="location" style={{ width: 24, height: 24, ...(sx as React.CSSProperties) }} />
);
const AccessTimeIcon = ({ sx }: { sx?: object }) => (
    <img src="/clock.svg" alt="time" style={{ width: 24, height: 24, ...(sx as React.CSSProperties) }} />
);
const CalendarTodayIcon = ({ sx }: { sx?: object }) => (
    <img src="/calendar.svg" alt="calendar" style={{ width: 24, height: 24, ...(sx as React.CSSProperties) }} />
);
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
    onClose: () => void;
    onEdit?: () => void;
}

export default function AppointmentDetailPopup({
    appointment,
    onClose,
    onEdit,
}: AppointmentDetailPopupProps) {
    const d = new Date(appointment.appointment_date);
    const dateStr = d.toLocaleDateString("en-US", { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false });
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
                    <Profile imageUrl={appointment.pet_image} size={50} isPet={true} />
                    <div className='pet-info'>
                        <div className="pet-name">{appointment.pet_name || "-"}</div>
                        <div className="pet-id">id: {appointment.pet_id}</div>
                    </div>
                </PetSection>

                <InfoSection>
                    <InfoRow>
                        <CalendarTodayIcon sx={{ color: theme.colors.primary }} />
                        <InfoText>
                            <span className="label">Date</span>
                            <span className="value">{dateStr}</span>
                        </InfoText>
                    </InfoRow>

                    <InfoRow>
                        <AccessTimeIcon sx={{ color: theme.colors.primary }} />
                        <InfoText>
                            <span className="label">Time</span>
                            <span className="value">{timeStr}</span>
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
                                backgroundColor: appointment.status === 'Upcoming' ? '#4CAF50' : '#9E9E9E'
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
