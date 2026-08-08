"use client";

import AppointmentsList from "@/components/AppointmentsList";

export default function SalesAppointmentsPage() {
  // Brief specifies /training/appointments for this listing (scoped to current user).
  return (
    <AppointmentsList
      endpoint="/training/appointments"
      title="Mis citas."
      kicker="Citas"
    />
  );
}
