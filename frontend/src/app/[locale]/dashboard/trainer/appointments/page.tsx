"use client";

import AppointmentsList from "@/components/AppointmentsList";

export default function TrainerAppointmentsPage() {
  return (
    <AppointmentsList
      endpoint="/training/appointments"
      title="Mis citas."
      kicker="Citas"
    />
  );
}
