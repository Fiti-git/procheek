"use client";

import AppointmentsList from "@/components/AppointmentsList";
import { RoleGate } from "@/components/RoleGate";

function SalesAppointmentsPageInner() {
  // Brief specifies /training/appointments for this listing (scoped to current user).
  return (
    <AppointmentsList
      endpoint="/training/appointments"
      title="Mis citas."
      kicker="Citas"
    />
  );
}

export default function SalesAppointmentsPage() {
  return (
    <RoleGate allow={["principal_admin","vendedor"]}>
      <SalesAppointmentsPageInner />
    </RoleGate>
  );
}
