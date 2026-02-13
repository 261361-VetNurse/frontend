import type { DashboardMedicineDetailData, DashboardResponse } from "@/types/domain/dashboard";
import type { MedicineReminderVM } from "@/types/domain/medication";
import { mockEachDayMedicines } from "./medication.mock";
import { mockOwner, mockUserProfile } from "./owner.mock";
import { mockPets } from "./pets.mock";

function mapFrequencyLabel(value: string): string {
  if (value === "-1") return "Everyday";

  const dayMap: Record<string, string> = {
    "0": "Mon",
    "1": "Tue",
    "2": "Wed",
    "3": "Thu",
    "4": "Fri",
    "5": "Sat",
    "6": "Sun",
  };

  return dayMap[value] ?? value;
}

const ownerPets = mockPets.filter((pet) => pet.user_id === mockOwner.id);

export const mockDashboardData: DashboardResponse = {
  success: true,
  data: {
    fname: mockUserProfile.fname,
    lname: mockUserProfile.lname,
    profile_image: mockUserProfile.picture_url,
    pets: ownerPets.map((pet) => ({
      pet_id: pet._id,
      profile_image: pet.profile_image || "",
      name: pet.name,
    })),
    medicines_notifications: mockEachDayMedicines.slice(0, 4).map((item) => ({
      _id: item._id,
      title: `${item.medicine_name} - ${item.reminder_time[0] || "09:00"}`,
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      dosage: item.medicine_dosage,
      pet_image: item.pet_image || "",
      notification_at: `2026-02-02T${item.reminder_time[0] || "09:00"}:00`,
      frequency: mapFrequencyLabel(item.medicine_frequency),
      status: "pending",
    })),
    appointments: [
      {
        _id: "apt-001",
        pet_name: ownerPets[0]?.name || "Mochi",
        pet_image: ownerPets[0]?.profile_image || "",
        appointment_date: "2026-02-20T11:00:00.000Z",
        location: "Novel CMU",
      },
      {
        _id: "apt-002",
        pet_name: ownerPets[1]?.name || "Taro",
        pet_image: ownerPets[1]?.profile_image || "",
        appointment_date: "2026-02-24T10:30:00.000Z",
        location: "Clinic Room 2",
      },
    ],
  },
};

export const mockMedicationNotificationDetail: DashboardMedicineDetailData = {
  success: true,
  data: mockEachDayMedicines.map((item) => ({
    _id: item._id,
    medicine_id: item.medicine_id,
    medicine_name: item.medicine_name,
    dosage: item.medicine_dosage,
    pet_id: item.pet_id,
    pet_name: item.pet_name,
    pet_image: item.pet_image || "",
    notification_at: `2026-02-02T${item.reminder_time[0] || "09:00"}:00`,
    frequency: mapFrequencyLabel(item.medicine_frequency),
    time_per_day: Math.max(item.reminder_time.length, 1),
    status: "pending",
    istaken: false,
    taken_at: "",
  })),
};

export function getMockDashboardHome(): DashboardResponse {
  return mockDashboardData;
}

export function getMockMedicationDetail(identifier: string): MedicineReminderVM {
  const detail = mockEachDayMedicines.find(
    (item) => item._id === identifier || item.medicine_id === identifier,
  );

  if (!detail) {
    throw new Error("Mock medication detail not found");
  }

  return detail;
}
