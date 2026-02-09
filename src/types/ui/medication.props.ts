// UI Component Props - Medication Components

export type OccurrenceStatus = "pending" | "taken" | "missed";

export type ReminderBoxProps = {
    petImageUrl: string;
    medicineName: string;
    dosage?: string;
    schedule: { frequency_label: string; time: string };
    status: string;
    petImageSize?: number;
    onClick?: () => void;
};

export interface TimeSlot {
    id: string;
    time: string;
    status: OccurrenceStatus;
    is_taken: boolean;
    taken_at?: string;
}
