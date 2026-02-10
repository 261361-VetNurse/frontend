export interface DashboardPet {
    pet_id: number;
    name: string;
    species?: string | null;
    breed?: string | null;
    in_medical?: boolean | null;
    profile_image?: string | null;
}

export interface DashboardNotification {
    _id: string; // From router string(notification_id)
    notification_id: number;
    title: string;
    medicine_id: string; // From router string(medicine_id)
    medicine_name?: string | null;
    dosage?: string | null;
    frequency?: string | null;
    reminder_time: string[];
    time_per_day?: number; // Optional as not always in router response
    pet_id: string; // From router string(pet_id)
    pet_name?: string | null;
    pet_image?: string | null;
    notification_at: string | Date; // Date object or ISO format
    time?: string; // HH:MM from router
    status?: string; // e.g., "pending"
    istaken: boolean;
}

export interface DashboardAppointment {
    _id: string; // From router string(appointment_id)
    appointment_id: number;
    pet_id: string; // From router string(pet_id)
    pet_name?: string | null;
    pet_image?: string | null;
    location?: string | null;
    appointment_date: string | Date; // Date object or ISO format
    appointment_time?: string | null; // HH:MM format
    status: string;
    notification_status?: string; // from router
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
