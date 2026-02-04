export type AppointmentStatus = "upcoming" | "completed" | "canceled";

export type Appointment = {
  _id: string;
  pet_id: string;
  user_id: string;
  note?: string;
  location: string;
  appointment_date: string; // ISO String
  status: AppointmentStatus;
  created_at?: string;
  updated_at?: string;
};

export interface AppointmentNotification {
  _id: string;
  pet_id: string;
  user_id: string;
  appointment_id: string;
  title: string;
  notification_at: string; // ISO Date
  sending_status: string;
  status: string;
  sending_count: number;
  created_at: string;
  updated_at: string;
}
