"use client";

import AppointmentsList from "@/components/AppointmentsList";
import { RoleGate } from "@/components/RoleGate";

function TrainerAppointmentsPageInner() {
  return (
    <AppointmentsList
      endpoint="/training/appointments"
      title="Mis citas."
      kicker="Citas"
    />
  );
}

export default function TrainerAppointmentsPage() {
  return (
    <RoleGate allow={["principal_admin","capacitador"]}>
      <TrainerAppointmentsPageInner />
    </RoleGate>
  );
}
