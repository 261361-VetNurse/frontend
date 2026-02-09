export type NotificationType = "Appointment" | "Medicine" | "System" | "Record";

export interface NotificationItem {
    _id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string; // ISO string

    // Optional UI helpers
    image_url?: string;
    link_url?: string; // Deep link if needed
}
