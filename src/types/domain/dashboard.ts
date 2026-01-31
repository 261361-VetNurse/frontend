export interface DashboardPet {
    pet_id: string;
    profile_image: string;
    name: string;
}

export interface DashboardNotification {
    _id: string;
    title: string;
    medicine_id: string;
    medicine_name: string;
    pet_id: string;
    pet_name: string;
    pet_image: string;
    notification_at: string; // ISO date string
    status: string;
    istaken: boolean;
}

export interface DashboardAppointment {
    _id: string;
    pet_id: string;
    pet_name: string;
    pet_image: string;
    appointment_date: string; // ISO date string
    status: string;
    notification_status: string;
    note: string;
}

export interface DashboardData {
    fname: string;
    lname: string;
    pets: DashboardPet[];
    medicines_notifications: DashboardNotification[];
    appointments: DashboardAppointment[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}
