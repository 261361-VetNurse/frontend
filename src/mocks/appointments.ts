import type { Appointment } from "@/types/Appointment";

export const mockAppointmentsByPetId: Record<string, Appointment[]> = {
  "4302459": [
    {
      id: "apt-001",
      petId: "4302459",
      petName: "Lee",
      date: "2025-12-17",
      time: "11:00 A.M.",
      location: "ห้องอัลตราซาวด์, Novel CMU",
      status: "upcoming",
    },
    {
      id: "apt-002",
      petId: "4302459",
      petName: "Lee",
      date: "2025-12-20",
      time: "11:00 A.M.",
      location: "ห้องอัลตราซาวด์, Novel CMU",
      status: "upcoming",
    },
    {
      id: "apt-003",
      petId: "4302459",
      petName: "Lee",
      date: "2025-12-10",
      time: "09:00 A.M.",
      location: "ห้องตรวจ 1, Novel CMU",
      status: "completed",
    },
  ],

  "430587": [
    {
      id: "apt-004",
      petId: "430587",
      petName: "Tom",
      date: "2025-12-05",
      time: "02:00 P.M.",
      location: "ห้องตรวจ 2, Novel CMU",
      status: "canceled",
    },
  ],
};

export const mockAppointments: Appointment[] = Object.values(mockAppointmentsByPetId).flat();
