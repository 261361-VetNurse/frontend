"use client";

import { useParams } from "next/navigation";

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  return (
    <div>
      <h1>Appointment Detail</h1>
      <p>Appointment ID: {appointmentId}</p>
    </div>
  );
}
