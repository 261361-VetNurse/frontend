// Medicine notification types (matching backend NotificationItem)
export interface NotificationItem {
    notification_id: number;
    title: string;
    notification_at: string; // ISO format
    istaken: boolean;
    pet_id: number;
    message?: string; // Optional message field
}

export interface NotificationDetail extends NotificationItem {
    taken_at?: string | null;
    pet_name?: string | null;
    pet_image?: string | null;
    medicine_id: number;
    medicine_name?: string | null;
    dosage?: string | null;
    frequency?: string | null; // Match backend frequency field
    reminder_time: string[];
    time_per_day: number;
}

export interface UnifiedNotification {
    type: 'medicine' | 'appointment';
    notification_id: number;
    title: string;
    notification_at: string;
    is_read: boolean;
    status: string;
    payload: { location?: string;[key: string]: unknown } | null;
    created_at: string;
}
