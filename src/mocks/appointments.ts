import type { Appointment } from "@/types/Appointment";
import { mockPets } from "@/mocks/pets.mock";

const [mochi, taro, luna] = mockPets;

export const mockAppointmentsByPetId: Record<string, Appointment[]> = {
  [mochi._id]: [
    {
      id: "apt-001",
      petId: mochi._id,
      petName: mochi.name,
      date: "2026-01-15",
      time: "11:00 A.M.",
      location: "ห้องอัลตราซาวด์, Novel CMU",
      status: "upcoming",
    },
    {
      id: "apt-002",
      petId: mochi._id,
      petName: mochi.name,
      date: "2026-01-20",
      time: "02:00 P.M.",
      location: "ห้องตรวจ 1, Novel CMU",
      status: "upcoming",
    },
    {
      id: "apt-003",
      petId: mochi._id,
      petName: mochi.name,
      date: "2025-12-10",
      time: "09:00 A.M.",
      location: "ห้องตรวจ 1, Novel CMU",
      status: "completed",
    },
  ],

  [taro._id]: [
    {
      id: "apt-004",
      petId: taro._id,
      petName: taro.name,
      date: "2026-01-12",
      time: "10:30 A.M.",
      location: "ห้องตรวจ 2, Novel CMU",
      status: "upcoming",
    },
  ],

  [luna._id]: [
    {
      id: "apt-005",
      petId: luna._id,
      petName: luna.name,
      date: "2026-01-05",
      time: "09:00 A.M.",
      location: "ห้องฉีดวัคซีน, Novel CMU",
      status: "completed",
    },
  ]
};

export const allMockAppointments: Appointment[] = Object.values(mockAppointmentsByPetId).flat();