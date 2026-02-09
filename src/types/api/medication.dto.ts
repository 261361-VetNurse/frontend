// API DTO Types for Medication

export type AddMedicationPayloadV2 = {
    pets_id: string;
    medicine_name: string;
    dosage: string;
    frequency_type: "everyday" | "interval_hours" | "custom";
    interval_hours?: number;
    days_of_week?: string[];
    measurement_times_per_day: number;
    times: string[];
    starting_date: string;
};

export type EditMedicationPayload = {
    pets_id: string;
    medicine_name: string;
    dosage: string;
    frequency_type: "everyday" | "interval_hours" | "custom";
    interval_hours?: number;
    days_of_week?: string[];
    measurement_times_per_day: number;
    times: string[];
    starting_date: string;
};

export type MedicationEditRecord = {
    notification_id: string;
    medicine_id: string;
    pet: {
        _id: string;
        name: string;
        profile_image?: string;
    };
    medicine: {
        name: string;
        dosage: string;
    };
    schedule: {
        frequency_type: "everyday" | "interval_hours" | "custom";
        interval_hours?: number;
        days_of_week?: string[];
        measurement_times_per_day: number;
        times: string[];
        starting_date: string;
    };
};
