export type AppointmentStatus = "upcoming" | "completed" | "canceled";

export type Appointment = {
  _id: string;
  pet_id: string;
  pet_name: string;
  pet_image: string;
  note?: string;
  location: string;
  appointment_date: string; // ISO String
  status: AppointmentStatus;
  created_at?: string;
  updated_at?: string;
};
