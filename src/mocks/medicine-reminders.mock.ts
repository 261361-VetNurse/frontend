import {MedicineReminderVM} from "@/types/medicine-reminder";

export const mockMedicineReminderVMs: MedicineReminderVM[] = [
    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa10",
        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f601",
            name: "Mochi",
            image_url: "/pets-example/pet-ex1.svg",
        },
        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f811",
            name: "Probiotics Capsule",
            dosage: "150mg",
        },
        schedule: {
            frequency: { key: "everyday", label: "Everyday" },
            reminders: [
                {
                    id: "r1",
                    time: "02:00",
                    status: "taken",
                    taken_at: "2025-11-15T02:15:00Z",
                },
                {
                    id: "r2",
                    time: "20:00",
                },
            ],
            measurement_times_per_day: 2,
            starting_date: "2025-11-15",
        },
        medication_status: {
            is_stopped: false,
        },
    },

    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa11",
        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f602",
            name: "Taro",
            image_url: "/pets-example/pet-ex2.svg",
        },
        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f812",
            name: "Amoxicillin",
            dosage: "5 ml",
        },
        schedule: {
            frequency: { key: "interval_hours", label: "Every 8 hours", interval_hours: 8 },
            reminders: [
                { id: "r1", time: "06:00", status: "missed"},
                { id: "r2", time: "14:00"},
                { id: "r3", time: "22:00"},
            ],
            measurement_times_per_day: 3,
            starting_date: "2026-01-01",
        },
        medication_status: {
            is_stopped: false,
        },
    },

    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa12",
        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f603",
            name: "Luna",
            image_url: "/pets-example/pet-ex3.svg",
        },
        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f813",
            name: "Dewormer",
            dosage: "1 tab",
        },
        schedule: {
            frequency: {
                key: "custom",
                label: "Mon, Fri",
                days_of_week: ["mon", "fri"],
            },
            reminders: [{ id: "r1", time: "02:00" }],
            measurement_times_per_day: 1,
            starting_date: "2026-01-02",
        },
        medication_status: {
            is_stopped: false
        },
    },

    // Additional test cases for home page filtering
    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa13",
        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f601",
            name: "Mochi",
            image_url: "/pets-example/pet-ex1.svg",
        },
        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f814",
            name: "Vitamin D",
            dosage: "2 drops",
        },
        schedule: {
            frequency: { key: "everyday", label: "Everyday" },
            reminders: [
                {
                    id: "r1",
                    time: "12:00", // Noon - should show if within 2 hours
                },
            ],
            measurement_times_per_day: 1,
            starting_date: "2026-01-01",
        },
        medication_status: {
            is_stopped: false,
        },
    },

    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa14",
        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f602",
            name: "Taro",
            image_url: "/pets-example/pet-ex2.svg",
        },
        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f815",
            name: "Pain Relief",
            dosage: "1/2 tablet",
        },
        schedule: {
            frequency: { key: "everyday", label: "Everyday" },
            reminders: [
                {
                    id: "r1",
                    time: "07:00", // Morning - might be overdue depending on current time
                    status: "missed",
                },
            ],
            measurement_times_per_day: 1,
            starting_date: "2026-01-01",
        },
        medication_status: {
            is_stopped: false,
        },
    },
];
