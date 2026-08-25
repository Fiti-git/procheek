"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Presentation,
  Clock,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import KpiCard from "@/components/KpiCard";

type Summary = {
  sessions_this_month: number;
  hours_delivered: number;
  upcoming_appointments: number;
  avg_attendees: number;
};

type Session = {
  id: string;
  title: string;
  scheduledAt: string;
  attendeeCount: number;
  location: string;
  status: string;
};

export default function TrainerDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, list] = await Promise.all([
          apiGet<Summary>("/training/dashboard/summary"),
          apiGet<Session[]>("/training/sessions"),
        ]);
        setSummary(s);
        const upcoming = (Array.isArray(list) ? list : [])
          .filter((x) => x.scheduledAt && new Date(x.scheduledAt) >= new Date())
          .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
          .slice(0, 5);
        setSessions(upcoming);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker mb-2">Panel de capacitación</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">
          Buenas, aquí tu resumen.
        </h1>
      </div>

      {err && (
        <div className="card-enterprise p-4 text-sm text-ink-700">
          No pudimos cargar el resumen ({err}). Inicia sesión con un capacitador.
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard
          label="Sesiones del mes"
          value={summary?.sessions_this_month ?? 0}
          icon={Presentation}
        />
        <KpiCard
          label="Horas impartidas"
          value={summary?.hours_delivered ?? 0}
          icon={Clock}
          tone="coral"
        />
        <KpiCard
          label="Citas próximas"
          value={summary?.upcoming_appointments ?? 0}
          icon={Calendar}
        />
        <KpiCard
          label="Asistentes promedio"
          value={summary?.avg_attendees ?? 0}
          icon={Users}
        />
      </div>

      <div className="card-enterprise overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-line">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
              Próximas sesiones
            </p>
            <h2 className="font-display text-xl tracking-tight text-ink-900 mt-1">
              Agenda
            </h2>
          </div>
          <Link
            href="/dashboard/trainer/sessions"
            className="text-sm link-inline inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-canvas-2">
            <tr className="text-xs uppercase tracking-widest text-ink-500">
              <th className="text-left px-5 py-3 font-medium">Sesión</th>
              <th className="text-left px-5 py-3 font-medium">Fecha</th>
              <th className="text-left px-5 py-3 font-medium">Ubicación</th>
              <th className="text-right px-5 py-3 font-medium">Asistentes</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-ink-500 text-center">
                  Sin sesiones próximas.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-5 py-3 text-ink-900">{s.title}</td>
                <td className="px-5 py-3 text-ink-700">
                  {new Date(s.scheduledAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {s.location || "Por definir"}
                </td>
                <td className="px-5 py-3 text-right field-mono text-ink-900">
                  {s.attendeeCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
