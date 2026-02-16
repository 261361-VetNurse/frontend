// API DTO Types for Medication

export interface MedicineItem {
    medicine_id: number;
    name: string;
    dosage: string | null;
    frequency: string;
    status: string;
    start_date: string; // ISO string
    end_date: string; // ISO string
    reminder_time: string[];
    notes: string[];
    properties: string | null;
    image_urls: string[];
    created_at: string;
    updated_at: string;
}

export interface NotificationItem {
    _id: string; // Frontend often uses this as unique key
    notification_id: number;
    title: string;
    notification_at: string;
    istaken: boolean;
    pet_id: number;
    user_id: string;
    medicine_id: number;
    pet_name: string;
    pet_image: string;
    medicine_name: string;
    dosage: string;
    medicine_frequency: string;
    reminder_time: string[];
    status: string;
    created_at: string;
    updated_at: string;
}

export interface AddMedicationPayload {
    pet_id: number;
    name: string;
    dosage?: string;
    frequency: string; // "-1" for daily, or comma separated days
    reminder_time: string[];
    start_date: string; // ISO 8601 string
    end_date: string; // ISO 8601 string
    status?: string;
    properties?: string;
    image_urls?: string[];
}

export interface EditMedicationPayload {
    name?: string;
    note?: string; // New note to add
    properties?: string;
    image_urls?: string[];
    dosage?: string;
    frequency?: string;
    status?: string;
    reminder_time?: string[];
    start_date?: string;
    end_date?: string;
}
