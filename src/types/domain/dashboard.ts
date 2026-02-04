import { MedicineNotification } from "./medication";
import { AppointmentNotification } from "./appointment";

export interface DashboardPet {
    pet_id: string;
    profile_image: string;
    name: string;
}

export interface DashboardData {
    fname: string;
    lname: string;
    profile_image: string;
    pets: DashboardPet[];
    medicines_notifications: MedicineNotification[];
    appointments: AppointmentNotification[];
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardData;
}
