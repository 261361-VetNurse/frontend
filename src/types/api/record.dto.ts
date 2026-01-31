// API DTO Types for Medical Records/Symptoms

export type AddSymptomPayload = {
    pets_id: string;
    symptom_date: string;
    symptoms: string[];
    description?: string;
    images?: string[];
};

export type EditSymptomPayload = {
    pets_id: string;
    symptom_date: string;
    symptoms: string[];
    description?: string;
    images?: string[];
};
