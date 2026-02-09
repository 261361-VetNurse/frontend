export interface DashboardPet {
    pet_id: string;
    profile_image: string;
    name: string;
}

export interface DashboardMedicineNotification {
    _id: string;
    title: string;
    medicine_id: string;
    medicine_name: string;
    dosage: string;
    pet_image: string;
    notification_at: string;
    frequency: string;
    status: string;
}

export interface DashboardAppointmentNotification {
    _id: string;
    pet_name: string;
    pet_image: string;
    appointment_date: string;
    location: string;
}

export interface DashboardData {
    fname: string;
    lname: string;
    profile_image: string;
    pets: DashboardPet[];
    medicines_notifications: DashboardMedicineNotification[];
    appointments: DashboardAppointmentNotification[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}

export interface DashboardMedicineDetail {
    _id: string;
    medicine_id: string;
    medicine_name: string;
    dosage: string;
    pet_id: string;
    pet_name: string;
    pet_image: string;
    notification_at: string;
    frequency: string;
    time_per_day: number;
    status: string;
    istaken: boolean;
    taken_at: string;
}

export interface DashboardMedicineDetailData {
    success: boolean;
    data: DashboardMedicineDetail[];
}
