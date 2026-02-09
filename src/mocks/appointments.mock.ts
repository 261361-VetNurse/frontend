import type { Appointment } from "@/types/domain/appointment";
import { mockPets } from "@/mocks/pets.mock";

const mochi = mockPets.find(p => p.name === "Mochi") || mockPets[0];
const taro = mockPets.find(p => p.name === "Taro") || mockPets[1];
const luna = mockPets.find(p => p.name === "Luna") || mockPets[2];
const kiwi = mockPets.find(p => p.name === "Kiwi") || mockPets[3];

export const mockAppointments: Appointment[] = [
  {
    _id: "apt-001",
    pet_id: mochi._id,
    pet_name: mochi.name,
    pet_image: mochi.profile_image,
    appointment_date: "2026-01-20T11:00:00.000Z",
    location: "ห้องอัลตราซาวด์, Novel CMU",
    status: "upcoming",
    note: "Ultrasound checkup",
    created_at: "2026-01-01T10:00:00.000Z",
  },
  {
    _id: "apt-002",
    pet_id: mochi._id,
    pet_name: mochi.name,
    pet_image: mochi.profile_image,
    appointment_date: "2026-01-18T10:30:00.000Z",
    location: "ห้องตรวจ 1, Novel CMU",
    status: "upcoming",
    note: "Routine checkup",
    created_at: "2026-01-01T10:00:00.000Z",

  },
  {
    _id: "apt-003",
    pet_id: mochi._id,
    pet_name: mochi.name,
    pet_image: mochi.profile_image,
    appointment_date: "2025-12-10T09:00:00.000Z",
    location: "ห้องตรวจ 1, Novel CMU",
    status: "completed",
    created_at: "2025-11-20T10:00:00.000Z",
  },


  {
    _id: "apt-004",
    pet_id: taro._id,
    pet_name: taro.name,
    pet_image: taro.profile_image,
    appointment_date: "2026-01-12T10:30:00.000Z",
    location: "ห้องตรวจ 2, Novel CMU",
    status: "upcoming",
    created_at: "2026-01-05T10:00:00.000Z",
  },

  {
    _id: "apt-005",
    pet_id: luna._id,
    pet_name: luna.name,
    pet_image: luna.profile_image,
    appointment_date: "2026-01-05T09:00:00.000Z",
    location: "ห้องฉีดวัคซีน, Novel CMU",
    status: "completed",
    note: "Vaccination",
    created_at: "2026-01-01T10:00:00.000Z",
  },

  {
    _id: "apt-006",
    pet_id: kiwi._id,
    pet_name: kiwi.name,
    pet_image: kiwi.profile_image,
    appointment_date: "2026-02-10T09:00:00.000Z",
    location: "Exotic Pet Clinic",
    status: "upcoming",
    note: "Beak trimming",
    created_at: "2026-01-15T10:00:00.000Z",
  }
];