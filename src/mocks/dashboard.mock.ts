import { DashboardResponse, DashboardNotification, DashboardAppointment } from "@/types/dashboard";
import { mockPets } from "./pets.mock";

// Mock dashboard data for HomePage
export const mockDashboardData: DashboardResponse = {
    success: true,
    data: {
        fname: "สมหญิง",
        lname: "ใจบุญ",
        pets: mockPets.map(pet => ({
            pet_id: pet._id,
            profile_image: pet.profile_image || "",
            name: pet.name,
        })),
        medicines_notifications: [
            {
                _id: "notif-001",
                title: "Probiotics Capsule - 02:00",
                medicine_id: "65f1a9c2b0f3c1a2d3e4f811",
                medicine_name: "Probiotics Capsule",
                pet_id: "430242", // Mochi
                pet_name: "Mochi",
                pet_image: "/pets-example/pet-ex1.svg",
                notification_at: new Date().toISOString(), // Current time
                status: "pending",
                istaken: false,
            },
            {
                _id: "notif-002",
                title: "Amoxicillin - 06:00",
                medicine_id: "65f1a9c2b0f3c1a2d3e4f812",
                medicine_name: "Amoxicillin",
                pet_id: "430243", // Taro
                pet_name: "Taro",
                pet_image: "/pets-example/pet-ex2.svg",
                notification_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                status: "pending",
                istaken: false,
            },
            {
                _id: "notif-003",
                title: "Vitamin D - 12:00",
                medicine_id: "65f1a9c2b0f3c1a2d3e4f814",
                medicine_name: "Vitamin D",
                pet_id: "430242", // Mochi
                pet_name: "Mochi",
                pet_image: "/pets-example/pet-ex1.svg",
                notification_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
                status: "pending",
                istaken: false,
            },
        ],
        appointments: [
            {
                _id: "apt-001",
                pet_id: "430242", // Mochi
                pet_name: "Mochi",
                pet_image: "/pets-example/pet-ex1.svg",
                appointment_date: "2026-01-20T11:00:00.000Z",
                status: "upcoming",
                notification_status: "pending",
                note: "ห้องอัลตราซาวด์, Novel CMU",
            },
            {
                _id: "apt-002",
                pet_id: "430243", // Taro
                pet_name: "Taro",
                pet_image: "/pets-example/pet-ex2.svg",
                appointment_date: "2026-01-18T10:30:00.000Z",
                status: "upcoming",
                notification_status: "pending",
                note: "ห้องตรวจ 2, Novel CMU",
            },
        ],
    },
};

// Helper function to get medication detail by notification ID
export function getMockMedicationDetail(notificationId: string) {
    const notification = mockDashboardData.data.medicines_notifications.find(
        n => n._id === notificationId
    );

    if (!notification) return null;

    // Map to MedicineReminderVM structure
    return {
        notification_id: notification._id,
        pet: {
            _id: notification.pet_id,
            name: notification.pet_name,
            profile_image: notification.pet_image,
        },
        medicine: {
            _id: notification.medicine_id,
            name: notification.medicine_name,
            dosage: "150mg", // Default dosage
        },
        schedule: {
            frequency: { key: "everyday" as const, label: "Everyday" },
            reminders: [
                {
                    id: "r1",
                    time: new Date(notification.notification_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }),
                    is_taken: notification.istaken,
                    status: notification.status,
                },
            ],
            measurement_times_per_day: 1,
            starting_date: new Date().toISOString().split('T')[0],
        },
        medication_status: {
            is_stopped: false,
        },
    };
}
