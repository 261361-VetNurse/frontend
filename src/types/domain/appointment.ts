export type AppointmentStatus = "upcoming" | "completed" | "canceled";

export type Appointment = {
  id: string;
  petId: string;
  petName: string;
  date: string;    
  time: string;      
  location: string;
  status: AppointmentStatus;
};
