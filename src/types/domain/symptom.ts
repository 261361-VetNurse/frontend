export type SymptomSeverity = 'Mild' | 'Moderate' | 'Severe';

export interface SymptomRecord {
    _id: string;
    pet_id: string;
    symptom: string; // e.g., "Vomiting", "Coughing"
    severity?: SymptomSeverity;
    note?: string;
    images?: string[]; // Array of image URLs
    date: string; // ISO 8601 date string (YYYY-MM-DD or full timestamp)
    created_at: string;
    updated_at: string;
}

export interface CreateSymptomRecordRequest {
    pet_id: string;
    symptom: string;
    severity?: SymptomSeverity;
    note?: string;
    images?: string[];
    date: string;
}

export interface UpdateSymptomRecordRequest {
    symptom?: string;
    severity?: SymptomSeverity;
    note?: string;
    images?: string[];
    date?: string;
}

export interface SymptomCalendarResponse {
    [date: string]: SymptomRecord[]; // Key is date string (YYYY-MM-DD), Value is array of records for that day
}
