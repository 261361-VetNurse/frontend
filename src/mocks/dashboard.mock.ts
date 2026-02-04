import { DashboardResponse } from "@/types/domain/dashboard";
import { mockPets } from "./pets.mock";
import { mockUserProfile } from "./owner";

// Helper to find pet by name/ID for consistent data
const mochi = mockPets.find(p => p.name === "Mochi") || mockPets[0];
const taro = mockPets.find(p => p.name === "Taro") || mockPets[1];

// Mock dashboard data for HomePage
export const mockDashboardData: DashboardResponse = {
    success: true,
    data: {
        fname: mockUserProfile.fname,
        lname: mockUserProfile.lname,
        profile_image: mockUserProfile.picture_url,
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
                dosage: "150mg",
                pet_id: mochi._id,
                pet_name: mochi.name,
                pet_image: mochi.profile_image || "",
                notification_at: "2026-02-02T02:00:00",
                frequency: "Everyday",
                status: "pending",
                istaken: false,
            },
            {
                _id: "notif-002",
                title: "Amoxicillin - 06:00",
                medicine_id: "65f1a9c2b0f3c1a2d3e4f812",
                medicine_name: "Amoxicillin",
                dosage: "250mg",
                pet_id: taro._id,
                pet_name: taro.name,
                pet_image: taro.profile_image || "",
                notification_at: "2026-02-02T10:00:00",
                frequency: "Everyday",
                status: "pending",
                istaken: false,
            },
            {
                _id: "notif-003",
                title: "Vitamin D - 12:00",
                medicine_id: "65f1a9c2b0f3c1a2d3e4f814",
                medicine_name: "Vitamin D",
                dosage: "10mg",
                pet_id: mochi._id,
                pet_name: mochi.name,
                pet_image: mochi.profile_image || "",
                notification_at: "2026-02-02T12:00:00",
                frequency: "Mon,Thu",
                status: "pending",
                istaken: false,
            },
        ],
        appointments: [
            {
                _id: "apt-001",
                pet_id: mochi._id,
                pet_name: mochi.name,
                pet_image: mochi.profile_image || "",
                appointment_date: "2026-01-20T11:00:00.000Z",
                location: "ห้องอัลตราซาวด์, Novel CMU",
                status: "upcoming",
                notification_at: "2026-01-20T11:00:00.000Z",
                note: "ห้องอัลตราซาวด์, Novel CMU",
            },
            {
                _id: "apt-002",
                pet_id: taro._id,
                pet_name: taro.name,
                pet_image: taro.profile_image || "",
                appointment_date: "2026-01-18T10:30:00.000Z",
                location: "ห้องตรวจ 2, Novel CMU",
                status: "upcoming",
                notification_at: "2026-01-18T10:30:00.000Z",
                note: "ห้องตรวจ 2, Novel CMU",
            },
        ],
    },
};