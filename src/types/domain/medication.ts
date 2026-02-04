export type MedicineStatus = "TAKE" | "STOP";

export type MedicineFrequencyEnum = "-1" | "0" | "1" | "2" | "3" | "4" | "5" | "6";
// -1=Daily, 0=Mon, 6=Sun (Based on schema comment, though usually 0-6 is Sun-Sat or Mon-Sun depending on convention. Schema says 0=Mon, 6=Sun)

export interface Medicine {
    _id: string;
    user_id: string;
    pet_id: string;
    name: string;
    notes: string[];
    properties: string; // "properties" in schema is string, might need clarification if it's meant to be something else, but strictly following schema.
    image_urls: string[];
    dosage: string;
    frequency: MedicineFrequencyEnum;
    status: MedicineStatus; // "TAKE" | "STOP"
    reminder_time: string[]; // Date array in schema, usually ISO strings in frontend
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export type NotificationSendingStatus = "pending" | "sent" | "failed"; // Example status
export type NotificationStatus = "pending" | "taken" | "skipped";

export interface EachDayMedicine {
    _id: string; // Implicit Mongo ID
    pet_id: string;
    user_id: string;
    medicine_id: string;
    medicine_name: string;
    medicine_dosage: string;
    medicine_frequency: string;
    pet_name: string;
    pet_image: string;
    reminder_time: string[];
    status?: MedicineStatus; // Optional to handle backward compatibility or lack of it in some mocks
    created_at: string;
    updated_at: string;
}

export type MedicineReminderVM = EachDayMedicine;