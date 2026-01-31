// Domain Type for Medical Records

export type MedicalRecord = {
    id: string;
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
    created_at: string;
    updated_at: string;
};
