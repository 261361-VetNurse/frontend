// API DTO Types for Medical Records

export type AddMedicalPayload = {
    pets_id: string;
    medical_date: string;
    medical_type: string;
    clinic_name?: string;
    vet_name?: string;
    diagnosis?: string;
    treatment?: string;
    prescription?: string;
    note?: string;
    images?: string[];
};
