export type MedicineStatus = "active" | "stopped" | "completed";

export interface Medicine {
    medicine_id: number;
    user_id?: number;
    pet_id: number;
    name: string;
    notes?: string[]; // Array of notes (max 3 per backend)
    properties?: string;
    image_urls?: string[];
    dosage?: string;
    frequency: string; // Renamed from medicine_frequency to frequency
    status?: string; // "active", "stopped", "completed"
    reminder_time: string[]; // Array of times in HH:MM format
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    created_at?: string;
    updated_at?: string;
}

export interface NotificationItem {
    notification_id: number;
    medicine_id: number;
    pet_id: number;
    pet_name?: string;
    pet_image?: string;
    medicine_name?: string;
    dosage?: string;
    reminder_time: string[];
    istaken: boolean;
}

export interface NotificationDetail extends NotificationItem {
    taken_at?: string;
    pet_name?: string;
    pet_image?: string;
    medicine_id: number;
    medicine_name?: string;
    dosage?: string;
    frequency?: string;
    reminder_time: string[];
    time_per_day: number;
    created_at?: string;
    updated_at?: string;
}