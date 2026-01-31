// API DTO Types for Appointments

export type AddAppointmentPayload = {
    pets_id: string;
    clinic_name: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
    note?: string;
};

export type EditAppointmentPayload = {
    pets_id: string;
    clinic_name: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
    note?: string;
};
