// API DTO Types for Dashboard

export interface DashboardPet {
    pet_id: number;
    name: string;
    species?: string;
    breed?: string;
    in_medical?: boolean;
    profile_image: string;
}

export interface DashboardNotification {
    _id: string;
    notification_id: number;
    title: string;
    medicine_id: string | number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    reminder_time: string[];
    pet_id: string | number;
    pet_name: string;
    pet_image: string;
    notification_at: string;
    time: string;
    status: string;
    istaken: boolean;
}

export interface DashboardAppointment {
    _id: string;
    appointment_id: number;
    pet_id: string | number;
    pet_name: string;
    pet_image: string;
    location: string;
    appointment_date: string;
    status: string;
    notification_status: string;
    note: string;
}

export interface DashboardDataRes {
    fname: string;
    lname: string;
    profile_image: string;
    pets: DashboardPet[];
    medicines_notifications: DashboardNotification[];
    appointments: DashboardAppointment[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardDataRes;
}
