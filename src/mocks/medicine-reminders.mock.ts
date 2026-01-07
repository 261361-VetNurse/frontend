import { MedicineReminderVM } from "@/types/medicine-reminder";

export const mockMedicineReminders: MedicineReminderVM[] = [
    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa02",

        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f601",
            name: "Mochi",
            image_url: "/pets-example/pet-ex1.svg",
        },

        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f801",
            name: "Cetirizine",
            dosage: "1/2 tab",
        },

        schedule: {
            date: "Today",
            time: "20:00",
            datetime: "2026-01-06T20:00:00.000Z",
        },

        is_read: false,
    },

    {
        notification_id: "65f1a9c2b0f3c1a2d3e4fa04",

        pet: {
            id: "65f1a9c2b0f3c1a2d3e4f602",
            name: "Taro",
            image_url: "/pets-example/pet-ex2.svg",
        },

        medicine: {
            id: "65f1a9c2b0f3c1a2d3e4f802",
            name: "Amoxicillin",
            dosage: "5 ml",
        },

        schedule: {
            date: "Today",
            time: "04:00",
            datetime: "2026-01-06T04:00:00.000Z",
        },

        is_read: true,
    },
];
