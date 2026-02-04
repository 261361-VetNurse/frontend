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

export interface MedicineNotification {
    _id: string; // Implicit Mongo ID
    pet_id: string;
    user_id: string;
    medicine_id: string;
    title: string;
    pet_image: string;
    notification_at: string;
    sending_status: string; // Schema says string
    status: string; // Schema says string
    sending_count: number;
    istaken: boolean;
    created_at: string;
    updated_at: string;
}