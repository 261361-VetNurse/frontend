import { NotificationItem } from "@/types/domain/notification";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const mockNotifications: NotificationItem[] = [
    {
        _id: "notif_001",
        user_id: "user_001",
        title: "Appointment",
        message: "Lee หมอนัด 17/12/2025 11.00",
        type: "Appointment",
        is_read: false,
        created_at: new Date(today.getTime() - 5 * 60000).toISOString(), // 5 min ago
        image_url: "/images/lee.png"
    },
    {
        _id: "notif_002",
        user_id: "user_001",
        title: "Medicine",
        message: "Lee อย่าลืมทานยา ABO 250 mg",
        type: "Medicine",
        is_read: false,
        created_at: new Date(today.getTime() - 48 * 60000).toISOString(), // 48 min ago
        image_url: "/images/lee.png"
    },
    {
        _id: "notif_003",
        user_id: "user_001",
        title: "System",
        message: "Tom ได้รับการยืนยันแล้ว",
        type: "System",
        is_read: true,
        created_at: twoDaysAgo.toISOString(), // 2 days ago
        image_url: "/images/approve.png"
    },
    {
        _id: "notif_004",
        user_id: "user_001",
        title: "Record",
        message: "บันทึกอาการฉุกเฉินได้ถูกสร้างแล้ว",
        type: "Record",
        is_read: true,
        created_at: yesterday.toISOString(),
        image_url: "/images/lee.png"
    }
];
