// API DTO Types for Medical Records/Symptoms

export interface PetRecordItem {
    record_id: number;
    pet_id: number;
    pet_name: string;
    pet_image: string;
    note: string;
    note_image: string[];
    time_added: string; // ISO string for calendar
}

export interface PetRecordDetail extends PetRecordItem {
    date_added: string;
    time_added_only: string; // HH:MM
}

export interface AddSymptomPayload {
    pet_id: number;
    note: string;
    note_image?: string[];
    date_added?: string; // YYYY-MM-DD
    time_added?: string; // HH:MM
}

export interface EditSymptomPayload {
    note?: string;
    note_image?: string[];
    date_added?: string; // YYYY-MM-DD
    time_added?: string; // HH:MM
}
