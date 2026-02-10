export type MedicineStatus = "active" | "stopped" | "completed";

export interface Medicine {
    medicine_id: number;
    user_id?: number;
    pet_id: number;
    name: string;
    notes: string[]; // Array of notes (max 3 per backend)
    properties?: string | null;
    image_urls: string[];
    dosage?: string | null;
    frequency: string; // "daily", "weekly", or comma-separated day numbers
    status: string; // "active", "stopped", "completed"
    reminder_time: string[]; // Array of times in HH:MM format
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    created_at?: string;
    updated_at?: string;
}

export interface NotificationItem {
    notification_id: number;
    title: string;
    notification_at: string; // ISO format
    istaken: boolean;
    pet_id: number;
}

export interface NotificationDetail extends NotificationItem {
    taken_at?: string | null;
    pet_name?: string | null;
    pet_image?: string | null;
    medicine_id: number;
    medicine_name?: string | null;
    dosage?: string | null;
    medicine_frequency?: string | null;
    reminder_time: string[];
    time_per_day: number;
    user_id?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}