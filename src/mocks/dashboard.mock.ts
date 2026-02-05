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
            },
        ],
    };
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
