"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

type Role =
  | "principal_admin"
  | "vendedor"
  | "capacitador"
  | "client"
  | "client_admin"
  | "subcontractor"
  | "employee";

export function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      setState("denied");
      return;
    }
    setState(allow.includes(u.role as Role) ? "ok" : "denied");
  }, [allow]);
  if (state === "loading") return null;
  if (state === "denied") {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-warn-bg text-warn flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
          Acceso restringido
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
