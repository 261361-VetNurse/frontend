// API DTO Types for Medical Records

export interface AddMedicalPayload {
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    note: string;
    images?: string[]; // Optional in backend record service
}
