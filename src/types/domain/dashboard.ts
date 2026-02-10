export interface DashboardPet {
    pet_id: number;
    name: string;
    species?: string | null;
    breed?: string | null;
    in_medical?: boolean | null;
    profile_image?: string | null;
}

export interface DashboardNotification {
    notification_id: number;
    title: string;
    medicine_id: number;
    medicine_name?: string | null;
    dosage?: string | null;
    frequency?: string | null;
    reminder_time: string[];
    time_per_day: number;
    pet_id: number;
    pet_name?: string | null;
    pet_image?: string | null;
    notification_at: string; // ISO format
    istaken: boolean;
}

export interface DashboardAppointment {
    appointment_id: number;
    pet_id: number;
    pet_name?: string | null;
    pet_image?: string | null;
    location?: string | null;
    appointment_date: string; // YYYY-MM-DD or ISO format
    appointment_time?: string | null; // HH:MM format
    status: string;
    note?: string | null;
}

export interface DashboardData {
    fname: string;
    lname: string;
    profile_image?: string | null;
    pets: DashboardPet[];
    medicines_notifications: DashboardNotification[];
    appointments: DashboardAppointment[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}
