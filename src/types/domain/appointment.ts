export type AppointmentStatus = "Upcoming" | "Completed" | "Canceled";

export type Appointment = {
  appointment_id: number;
  pet_id: number;
  pet_name?: string;
  pet_image?: string;
  location: string;
  appointment_date: string; // ISO String or YYYY-MM-DD
  appointment_time?: string; // Separate time field (HH:MM)
  status: AppointmentStatus;
  note?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
};
