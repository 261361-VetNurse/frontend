// UI Component Props - Appointment Components

export type AppointmentStatus = "upcoming" | "completed" | "canceled";

export type Appointment = {
    id: string;
    pets_id: string;
    clinic_name: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
    note?: string;
    status: AppointmentStatus;
    created_at: string;
    updated_at: string;
};

export type AppointmentCardProps = {
    appointment: Appointment;
    petName?: string;
    petImageUrl?: string;
    onEdit?: (appointment: Appointment) => void;
    onCancel?: (appointmentId: string) => void;
    onDelete?: (appointmentId: string) => void;
};

export type AppointmentDetailItem = {
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
};
