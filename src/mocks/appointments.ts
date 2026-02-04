import type { Appointment } from "@/types/domain/appointment";
import { mockPets } from "@/mocks/pets.mock";

const mochi = mockPets.find(p => p.name === "Mochi") || mockPets[0];
const taro = mockPets.find(p => p.name === "Taro") || mockPets[1];
const luna = mockPets.find(p => p.name === "Luna") || mockPets[2];
const kiwi = mockPets.find(p => p.name === "Kiwi") || mockPets[3];

export const mockAppointmentsByPetId: Record<string, Appointment[]> = {
  [mochi._id]: [
    {
      _id: "apt-001",
      pet_id: mochi._id,
      user_id: "65f1a9c2b0f3c1a2d3e4f501", // MOCK_USER_ID
      appointment_date: "2026-01-15T11:00:00.000Z",
      location: "ห้องอัลตราซาวด์, Novel CMU",
      status: "upcoming",
      note: "Ultrasound checkup",
      created_at: "2026-01-01T10:00:00.000Z",
    },
    {
      _id: "apt-002",
      pet_id: mochi._id,
      user_id: "65f1a9c2b0f3c1a2d3e4f501",
      appointment_date: "2026-01-20T14:00:00.000Z",
      location: "ห้องตรวจ 1, Novel CMU",
      status: "upcoming",
      note: "Routine checkup",
      created_at: "2026-01-01T10:00:00.000Z",

    },
    {
      _id: "apt-003",
      pet_id: mochi._id,
      user_id: "65f1a9c2b0f3c1a2d3e4f501",
      appointment_date: "2025-12-10T09:00:00.000Z",
      location: "ห้องตรวจ 1, Novel CMU",
      status: "completed",
      created_at: "2025-11-20T10:00:00.000Z",
    },
  ],

  [taro._id]: [
    {
      _id: "apt-004",
      pet_id: taro._id,
      user_id: "65f1a9c2b0f3c1a2d3e4f501",
      appointment_date: "2026-01-12T10:30:00.000Z",
      location: "ห้องตรวจ 2, Novel CMU",
      status: "upcoming",
      created_at: "2026-01-05T10:00:00.000Z",
    },
  ],

  [luna._id]: [
    {
      _id: "apt-005",
      pet_id: luna._id,
      user_id: "65f1a9c2b0f3c1a2d3e4f502",
      appointment_date: "2026-01-05T09:00:00.000Z",
      location: "ห้องฉีดวัคซีน, Novel CMU",
      status: "completed",
      note: "Vaccination",
      created_at: "2026-01-01T10:00:00.000Z",
    },
  ],

  [kiwi._id]: [
    {
      _id: "apt-006",
      pet_id: kiwi._id,
      user_id: "65f1a9c2b0f3c1a2d3e4f501",
      appointment_date: "2026-02-10T09:00:00.000Z",
      location: "Exotic Pet Clinic",
      status: "upcoming",
      note: "Beak trimming",
      created_at: "2026-01-15T10:00:00.000Z",
    }
  ]
};

export const allMockAppointments: Appointment[] = Object.values(mockAppointmentsByPetId).flat();

import { AppointmentNotification } from "@/types/domain/appointment";

export const mockAppointmentNotifications: AppointmentNotification[] = [
  {
    _id: "notif-apt-001",
    pet_id: mochi._id,
    user_id: "65f1a9c2b0f3c1a2d3e4f501", // MOCK_USER_ID
    appointment_id: "apt-001",
    title: "Upcoming Ultrasound Appointment for Mochi",
    notification_at: "2026-01-14T08:00:00.000Z", // 1 day before
    sending_status: "pending",
    status: "pending",
    sending_count: 0,
    created_at: "2026-01-01T10:00:00.000Z",
    updated_at: "2026-01-01T10:00:00.000Z",
  },
  {
    _id: "notif-apt-004",
    pet_id: taro._id,
    user_id: "65f1a9c2b0f3c1a2d3e4f501",
    appointment_id: "apt-004",
    title: "Reminder: Vet Visit for Taro",
    notification_at: "2026-01-12T08:00:00.000Z",
    sending_status: "sent",
    status: "read",
    sending_count: 1,
    created_at: "2026-01-05T10:00:00.000Z",
    updated_at: "2026-01-12T08:05:00.000Z",
  },
  {
    _id: "notif-apt-006",
    pet_id: kiwi._id,
    user_id: "65f1a9c2b0f3c1a2d3e4f501",
    appointment_id: "apt-006",
    title: "Beak Trimming for Kiwi",
    notification_at: "2026-02-09T08:00:00.000Z",
    sending_status: "pending",
    status: "pending",
    sending_count: 0,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z",
  }
];