export type OccurrenceStatus = "pending" | "taken" | "skipped" | "sent";

export interface ReminderOccurrence {
    reminder_id: string;
    plan_id: string; // References MedicineReminderVM._id
    pet: {
        pet_id: number;
        name: string;
        profile_image: string;
    };
    medicine: {
        _id: string;
        name: string;
        dosage: string;
    };
    time: string; // HH:mm
    scheduled_at: string; // ISO String
    status: OccurrenceStatus;
    taken_at?: string;
}
