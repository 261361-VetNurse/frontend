import { mockMedicineReminderVMs } from '@/mocks/medicine-reminders.mock';
import { mockPets } from '@/mocks/pets.mock';
import { DashboardData, DashboardNotification, DashboardResponse } from '@/types/dashboard';
import { MedicineReminderVM } from '@/types/medicine-reminder';

const DAY_MS = 24 * 60 * 60 * 1000;

function toNotificationAt(time: string, dayOffset: number): string {
    const [hours, minutes] = time.split(':').map((v) => Number(v));
    const d = new Date(Date.now() + dayOffset * DAY_MS);
    d.setHours(hours || 9, minutes || 0, 0, 0);
    return d.toISOString();
}

function buildMockNotifications(): DashboardNotification[] {
    return mockMedicineReminderVMs.slice(0, 3).map((plan, idx) => {
        const firstReminder = plan.schedule.reminders[0];
        const status = firstReminder?.status || (firstReminder?.is_taken ? 'taken' : 'pending');

        return {
            _id: plan.notification_id,
            title: `${plan.medicine.name} reminder`,
            medicine_id: plan.medicine._id,
            medicine_name: plan.medicine.name,
            pet_id: plan.pet._id,
            pet_name: plan.pet.name,
            pet_image: plan.pet.profile_image || '/pets-example/pet-ex1.svg',
            notification_at: toNotificationAt(firstReminder?.time || '09:00', idx % 2),
            status,
            istaken: Boolean(firstReminder?.is_taken),
        };
    });
}

function buildMockDashboardData(): DashboardData {
    const pets = mockPets.slice(0, 3).map((pet) => ({
        pet_id: pet._id,
        profile_image: pet.profile_image || '/pets-example/pet-ex1.svg',
        name: pet.name,
    }));

    const now = new Date();
    const upcoming1 = new Date(now.getTime() + DAY_MS);
    upcoming1.setHours(10, 30, 0, 0);
    const upcoming2 = new Date(now.getTime() + 2 * DAY_MS);
    upcoming2.setHours(15, 0, 0, 0);

    return {
        fname: 'Mock',
        lname: 'Owner',
        pets,
        medicines_notifications: buildMockNotifications(),
import { DashboardResponse, DashboardMedicineDetailData } from "@/types/domain/dashboard";
import { mockPets } from "./pets.mock";
import { mockUserProfile } from "./owner.mock";

const mochi = mockPets.find(p => p.name === "Mochi") || mockPets[0];
const taro = mockPets.find(p => p.name === "Taro") || mockPets[1];
const kiwi = mockPets.find(p => p.name === "Kiwi") || mockPets[3];

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
                medicine_id: "med_001",
                title: "Amoxicillin - 08:00",
                medicine_name: "Amoxicillin",
                dosage: "5ml",
                pet_image: mochi.profile_image || "",
                notification_at: "2026-02-02T08:00:00",
                frequency: "Everyday",
                status: "pending",
            },
            {
                _id: "notif-002",
                medicine_id: "med_003",
                title: "Flea Prevention - 10:00",
                medicine_name: "Flea Prevention",
                dosage: "1 vial",
                pet_image: taro.profile_image || "",
                notification_at: "2026-02-02T10:00:00",
                frequency: "Sat",
                status: "pending",
            },
            {
                _id: "notif-003",
                medicine_id: "med_002",
                title: "Vitamin Chews - 09:00",
                medicine_name: "Vitamin Chews",
                dosage: "1 chew",
                pet_image: mochi.profile_image || "",
                notification_at: "2026-02-02T09:00:00",
                frequency: "Tue",
                status: "pending",
            },
            {
                _id: "notif-004",
                medicine_id: "med_005",
                title: "Bird Vitamin - 07:00",
                medicine_name: "Bird Vitamin",
                dosage: "5 drops",
                pet_image: kiwi.profile_image || "",
                notification_at: "2026-02-02T07:00:00",
                frequency: "Everyday",
                status: "pending",
            },
        ],
        appointments: [
            {
                _id: 'mock-appointment-1',
                pet_id: pets[0]?.pet_id || '430242',
                pet_name: pets[0]?.name || 'Mochi',
                pet_image: pets[0]?.profile_image || '/pets-example/pet-ex1.svg',
                appointment_date: upcoming1.toISOString(),
                status: 'upcoming',
                notification_status: 'pending',
                note: 'Mock checkup appointment',
                _id: "apt-001",
                pet_name: mochi.name,
                pet_image: mochi.profile_image || "",
                appointment_date: "2026-01-20T11:00:00.000Z",
                location: "ห้องอัลตราซาวด์, Novel CMU",
            },
            {
                _id: "apt-002",
                pet_name: taro.name,
                pet_image: taro.profile_image || "",
                appointment_date: "2026-01-18T10:30:00.000Z",
                location: "ห้องตรวจ 2, Novel CMU",
            },
            {
                _id: 'mock-appointment-2',
                pet_id: pets[1]?.pet_id || '430243',
                pet_name: pets[1]?.name || 'Taro',
                pet_image: pets[1]?.profile_image || '/pets-example/pet-ex2.svg',
                appointment_date: upcoming2.toISOString(),
                status: 'upcoming',
                notification_status: 'pending',
                note: 'Mock vaccination appointment',
                _id: "apt-006",
                pet_name: kiwi.name,
                pet_image: kiwi.profile_image || "",
                appointment_date: "2026-02-10T09:00:00.000Z",
                location: "Exotic Pet Clinic",
            },
        ],
    },
};
    };
}

export const mockMedicationNotificationDetail: DashboardMedicineDetailData = {
    success: true,
    data: [
        {
            _id: "notif-001",
            medicine_id: "med_001",
            medicine_name: "Amoxicillin",
            dosage: "5ml",
            pet_id: mochi._id,
            pet_name: mochi.name,
            pet_image: mochi.profile_image || "",
            notification_at: "2026-02-02T08:00:00",
            frequency: "Everyday",
            time_per_day: 2,
            status: "pending",
            istaken: false,
            taken_at: "",
        },
        {
            _id: "notif-002",
            medicine_id: "med_003",
            medicine_name: "Flea Prevention",
            dosage: "1 vial",
            pet_id: taro._id,
            pet_name: taro.name,
            pet_image: taro.profile_image || "",
            notification_at: "2026-02-02T10:00:00",
            frequency: "Sat",
            time_per_day: 1,
            status: "pending",
            istaken: false,
            taken_at: "",
        },
        {
            _id: "notif-003",
            medicine_id: "med_002",
            medicine_name: "Vitamin Chews",
            dosage: "1 chew",
            pet_id: mochi._id,
            pet_name: mochi.name,
            pet_image: mochi.profile_image || "",
            notification_at: "2026-02-02T09:00:00",
            frequency: "Tue",
            time_per_day: 1,
            status: "pending",
            istaken: false,
            taken_at: "",
        },
        {
            _id: "notif-004",
            medicine_id: "med_005",
            medicine_name: "Bird Vitamin",
            dosage: "5 drops",
            pet_id: kiwi._id,
            pet_name: kiwi.name,
            pet_image: kiwi.profile_image || "",
            notification_at: "2026-02-02T07:00:00",
            frequency: "Everyday",
            time_per_day: 1,
            status: "pending",
            istaken: false,
            taken_at: "",
        },
    ]
}
export function getMockDashboardHome(): DashboardResponse {
    return {
        success: true,
        data: buildMockDashboardData(),
    };
}

export function getMockMedicationDetail(identifier: string): MedicineReminderVM {
    const plan = mockMedicineReminderVMs.find(
        (item) => item.notification_id === identifier || item.medicine._id === identifier
    );

    if (!plan) {
        throw new Error('Mock medication detail not found');
    }

    return plan;
}
