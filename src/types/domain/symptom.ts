export interface SymptomRecord {
    record_id: number; // Primary identifier from backend
    pet_id: number;
    pet_name: string; // Non-optional in backend responses
    pet_image: string; // Non-optional in backend responses
    date_added?: string; // YYYY-MM-DD from detail response
    time_added: string; // HH:MM or ISO datetime
    note: string;
    note_image: string[]; // Array of image URLs (max 4)
}

export interface SymptomRecordCreate {
    pet_id: number;
    note: string;
    note_image?: string[]; // Max 4 images
}

export interface SymptomRecordUpdate {
    note?: string;
    note_image?: string[]; // Max 4 images
}

export type SymptomCalendarResponse = SymptomRecord[];
