// Domain Type for Medical Records

export type MedicalRecord = {
    _id: string; // Typically Mongo returns _id
    pet_id: string;
    note: string;
    images: string[];
    created_at: string;
    updated_at: string;
};
