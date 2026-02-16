// Medical History Record (based on backend MedicalHistoryCreate)

export interface MedicalHistory {
    date: string; // YYYY-MM-DD format
    time: string; // HH:MM format
    note: string;
}

export interface MedicalHistoryCreate {
    date: string;
    time: string;
    note: string;
}
