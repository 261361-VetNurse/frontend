// API DTO Types for Appointments

export interface AppointmentItem {
    appointment_id: number;
    pet_id: number;
    pet_name: string;
    pet_image: string;
    location: string;
    appointment_date: string; // ISO format from backend
    appointment_time: string; // Formatted time from backend or derived
    status: "Upcoming" | "Completed" | "Canceled";
    note: string;
}

export interface AppointmentDetail {
    appointment_id: number;
    pet_id: number;
    user_id: number;
    location: string;
    appointment_date: string; // ISO string
    status: "Upcoming" | "Completed" | "Canceled";
    note: string;
    created_at: string;
    updated_at: string;
}

export interface AddAppointmentPayload {
    pet_id: number;
    location: string;
    appointment_date: string; // ISO 8601 string
    status?: "Upcoming" | "Completed" | "Canceled";
    note?: string;
}

export interface EditAppointmentPayload {
    location?: string;
    appointment_date?: string; // ISO 8601 string
    status?: "Upcoming" | "Completed" | "Canceled";
    note?: string;
}
