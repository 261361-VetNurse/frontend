import type { DashboardResponse } from "@/types/domain/dashboard";
import type { NotificationDetail } from "@/types/domain/medication";

export const mockDashboardData: DashboardResponse = {
  success: true,
  data: {
    fname: "Alice",
    lname: "Owner",
    profile_image: "",
    pets: [
      {
        pet_id: 430242,
        name: "Mochi",
        profile_image: "",
      },
    ],
    medicines_notifications: [
      {
        _id: "noti-001",
        notification_id: 1,
        title: "Amoxicillin - 09:00",
        medicine_id: "1001",
        medicine_name: "Amoxicillin",
        dosage: "5ml",
        reminder_time: ["09:00"],
        pet_id: "430242",
        pet_name: "Mochi",
        pet_image: "",
        notification_at: "2026-02-02T09:00:00.000Z",
        frequency: "Everyday",
        istaken: false,
      },
    ],
    appointments: [
      {
        _id: "apt-001",
        appointment_id: 1,
        pet_id: "430242",
        pet_name: "Mochi",
        pet_image: "",
        appointment_date: "2026-02-20T11:00:00.000Z",
        location: "Novel CMU",
        status: "Upcoming",
      },
    ],
  },
};

export const mockMedicationNotificationDetail: { success: boolean; data: NotificationDetail[] } = {
  success: true,
  data: [
    {
      notification_id: 1,
      medicine_id: 1001,
      pet_id: 430242,
      pet_name: "Mochi",
      pet_image: "",
      medicine_name: "Amoxicillin",
      dosage: "5ml",
      frequency: "Everyday",
      reminder_time: ["09:00"],
      time_per_day: 1,
      istaken: false,
      taken_at: "",
    },
  ],
};

export function getMockDashboardHome(): DashboardResponse {
  return mockDashboardData;
}

export function getMockMedicationDetail(identifier: string): NotificationDetail {
  const byId = Number(identifier);
  const detail = mockMedicationNotificationDetail.data.find(
    (item) => item.notification_id === byId || item.medicine_id === byId
  );

  if (!detail) {
    throw new Error("Mock medication detail not found");
  }

  return detail;
}
